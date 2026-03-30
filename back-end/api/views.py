import requests
import os
import platform 
import psutil
import docker
import urllib3
import socket
from concurrent.futures import ThreadPoolExecutor

from .models import RemoteMachine, Service, Notification
from .serializers import RemoteMachineSerializer, UserSerializer, ServiceSerializer, NotificationSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from wakeonlan import send_magic_packet

# Desabilita avisos de certificado SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def check_port(host, port, timeout=1):
    """Verifica se uma porta TCP está aberta."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except:
        return False

def check_ping(host):
    """Verifica se um host responde ao ping."""
    param = '-n' if platform.system().lower() == 'windows' else '-c'
    command = f"ping {param} 1 {host}"
    return os.system(command + " > /dev/null 2>&1") == 0

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                        context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

class SystemMonitorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        proxmox_url = os.getenv("PROXMOX_URL", "https://192.168.100.70:8006")
        token_id = os.getenv("PROXMOX_TOKEN_ID")
        token_secret = os.getenv("PROXMOX_TOKEN_SECRET")
        node_name = "guste"

        cpu_usage = psutil.cpu_percent()
        ram = psutil.virtual_memory()
        ram_percent = ram.percent
        ram_total = round(ram.total / (1024**3), 1)
        disk_usage = psutil.disk_usage('/').percent
        hostname = platform.node()
        status = "online"

        if token_id and token_secret:
            try:
                api_url = f"{proxmox_url}/api2/json/nodes/{node_name}/status"
                headers = {"Authorization": f"PVEAPIToken={token_id}={token_secret}"}
                response = requests.get(api_url, headers=headers, verify=False, timeout=1.5)
                
                if response.status_code == 200:
                    data = response.json().get('data', {})
                    cpu_usage = round(data.get('cpu', 0) * 100, 1)
                    ram_data = data.get('memory', {})
                    ram_percent = round((ram_data.get('used', 0) / ram_data.get('total', 1)) * 100, 1)
                    ram_total = round(ram_data.get('total', 0) / (1024**3), 1)
                    rootfs = data.get('rootfs', {})
                    disk_usage = round((rootfs.get('used', 0) / rootfs.get('total', 1)) * 100, 1)
                    hostname = f"{node_name} (Notebook)"
            except Exception as e:
                status = "limited"

        # Criar notificações reais se houver problemas
        if cpu_usage > 90:
            Notification.objects.get_or_create(title="Alta carga de CPU", message=f"O host {hostname} está com {cpu_usage}% de CPU.", level='error')
        if ram_percent > 95:
            Notification.objects.get_or_create(title="Memória Crítica", message=f"O host {hostname} está com {ram_percent}% de RAM.", level='error')

        return Response({
            "hostname": hostname,
            "cpu": cpu_usage,
            "ram_percent": ram_percent,
            "ram_total": ram_total,
            "disk_percent": disk_usage,
            "status": status,
            "alerts_count": Notification.objects.filter(is_read=False).count()
        })

class ServiceListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        services = Service.objects.all()
        data = []
        
        def process_service(service):
            service_data = ServiceSerializer(service).data
            try:
                # Extrair host e porta da URL
                from urllib.parse import urlparse
                parsed = urlparse(service.url)
                host = parsed.hostname
                port = parsed.port
                
                if not port:
                    port = 80 if parsed.scheme == 'http' else 443
                
                # Verifica porta TCP (muito mais preciso que ping)
                is_online = check_port(host, port)
                service_data['is_active'] = is_online
                
                # Se caiu, gera notificação
                if not is_online:
                    Notification.objects.get_or_create(
                        title=f"Serviço Fora do Ar: {service.name}",
                        message=f"Não foi possível conectar em {host}:{port}",
                        level='error'
                    )
            except:
                service_data['is_active'] = False
            return service_data

        with ThreadPoolExecutor(max_workers=10) as executor:
            data = list(executor.map(process_service, services))
            
        return Response(data)

class RemoteMachineListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        machines = RemoteMachine.objects.all()
        
        def process_machine(machine):
            machine.is_online = check_ping(machine.ip_address)
            return machine

        with ThreadPoolExecutor(max_workers=5) as executor:
            machines = list(executor.map(process_machine, machines))
            
        serializer = RemoteMachineSerializer(machines, many=True)
        return Response(serializer.data)

class WakeOnLanView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        mac = request.data.get('mac_address')
        if mac:
            send_magic_packet(mac)
            return Response({"message": f"Magic packet sent to {mac}"})
        return Response({"error": "MAC required"}, status=400)

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        notifications = Notification.objects.all()[:50]
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        # Marcar todas como lidas
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read"})

class DockerMonitorView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            client = docker.from_env()
            containers = client.containers.list(all=True)
            container_data = []
            for container in containers:
                mem_percent = 0.0
                if container.status == 'running':
                    try:
                        stats = container.stats(stream=False)
                        mem_stats = stats.get('memory_stats', {})
                        usage = mem_stats.get('usage', 0)
                        limit = mem_stats.get('limit', 1)
                        if limit > 0:
                            mem_percent = round((usage / limit) * 100, 2)
                    except:
                        pass
                container_data.append({
                    "id": container.short_id,
                    "name": container.name,
                    "status": container.status,
                    "image": container.image.tags[0] if container.image.tags else "N/A",
                    "cpu_percent": 0.0, # CPU stats requerem 2 leituras consecutivas
                    "ram_percent": mem_percent,
                })
            return Response(container_data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class DockerActionView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        container_id = request.data.get('container_id')
        action = request.data.get('action') 
        try:
            client = docker.from_env()
            container = client.containers.get(container_id)
            if action == 'restart': container.restart()
            elif action == 'stop': container.stop()
            elif action == 'start': container.start()
            return Response({"message": f"Container {action}ed successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=500)
