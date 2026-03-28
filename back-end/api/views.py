import requests
import os
import platform 
import psutil
import docker
import urllib3

from .models import RemoteMachine, Service
from .serializers import RemoteMachineSerializer, UserSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from wakeonlan import send_magic_packet

# Desabilita avisos de certificado SSL (comum no Proxmox)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

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
        # 1. Tenta carregar as configurações do seu .env
        # Note: Mudei o padrão para .70 para evitar o erro de rota do .200
        proxmox_url = os.getenv("PROXMOX_URL", "https://192.168.100.70:8006")
        token_id = os.getenv("PROXMOX_TOKEN_ID")
        token_secret = os.getenv("PROXMOX_TOKEN_SECRET")
        node_name = "guste"

        # Valores de fallback (dados do container)
        cpu_usage = psutil.cpu_percent()
        ram = psutil.virtual_memory()
        ram_percent = ram.percent
        ram_total = round(ram.total / (1024**3), 1)
        disk_usage = psutil.disk_usage('/').percent
        hostname = platform.node()
        status = "online"

        # 2. Se houver Token, busca dados REAIS do Hardware via API Proxmox
        if token_id and token_secret:
            try:
                api_url = f"{proxmox_url}/api2/json/nodes/{node_name}/status"
                headers = {"Authorization": f"PVEAPIToken={token_id}={token_secret}"}
                
                response = requests.get(api_url, headers=headers, verify=False, timeout=1.5)
                
                if response.status_code == 200:
                    data = response.json().get('data', {})
                    # Dados do Notebook Real (Host)
                    cpu_usage = round(data.get('cpu', 0) * 100, 1)
                    ram_data = data.get('memory', {})
                    ram_percent = round((ram_data.get('used', 0) / ram_data.get('total', 1)) * 100, 1)
                    ram_total = round(ram_data.get('total', 0) / (1024**3), 1)
                    
                    # Dados de Disco do Notebook de 890GB
                    rootfs = data.get('rootfs', {})
                    disk_usage = round((rootfs.get('used', 0) / rootfs.get('total', 1)) * 100, 1)
                    hostname = f"{node_name} (Notebook)"
            except Exception as e:
                print(f"Erro ao conectar na API do Proxmox: {e}")
                status = "limited"

        # 3. Lógica de Alertas Reais
        alerts = []
        if cpu_usage > 85:
            alerts.append({"id": 1, "message": "Host com CPU elevada!", "level": "error"})
        if ram_percent > 90:
            alerts.append({"id": 2, "message": "RAM física quase esgotada!", "level": "warning"})
        
        # Bateria (O "Nobreak" do seu notebook)
        battery = psutil.sensors_battery()
        if battery and not battery.power_plugged and battery.percent < 20:
            alerts.append({"id": 5, "message": "Bateria Fraca!", "level": "error"})

        return Response({
            "hostname": hostname,
            "cpu": cpu_usage,
            "ram_percent": ram_percent,
            "ram_total": ram_total,
            "disk_percent": disk_usage,
            "services_count": len(psutil.pids()),
            "alerts": alerts,
            "alerts_count": len(alerts),
            "status": status
        })

# --- Mantendo suas outras classes originais ---

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class ServiceListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        services = Service.objects.all()
        data = []
        for service in services:
            service_data = ServiceSerializer(service).data
            host = service.url.split("//")[-1].split(":")[0].split("/")[0]
            param = '-n' if platform.system().lower() == 'windows' else '-c'
            command = f"ping {param} 1 {host}"
            is_online = os.system(command) == 0
            service_data['is_active'] = is_online
            data.append(service_data)
        return Response(data)

class RemoteMachineListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        machines = RemoteMachine.objects.all()
        serializer = RemoteMachineSerializer(machines, many=True)
        return Response(serializer.data)

class WakeOnLanView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        mac = request.data.get('mac_address')
        if mac:
            send_magic_packet(mac)
            return Response({"message": "Magic packet sent!"})
        return Response({"error": "MAC required"}, status=400)

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
                    "cpu_percent": 0.0,
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
