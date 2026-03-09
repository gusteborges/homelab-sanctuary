from http import client

import requests
import os
import platform 
import psutil
import docker

from .models import RemoteMachine, Service
from .serializers import RemoteMachineSerializer, UserSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from rest_framework.views import APIView
from wakeonlan import send_magic_packet


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
        # Coleta de dados base
        ram = psutil.virtual_memory()
        cpu_usage = psutil.cpu_percent(interval=1)
        disk_usage = psutil.disk_usage('/').percent
        process_count = len(psutil.pids())
        
        # Lógica de Alertas Reais
        alerts = []
        if cpu_usage > 70:
            alerts.append({"id": 1, "message": "CPU em nível crítico!", "level": "error"})
        if ram.percent > 80:
            alerts.append({"id": 2, "message": "Memória RAM quase esgotada!", "level": "warning"})
        if disk_usage > 90:
            alerts.append({"id": 3, "message": "Espaço em disco quase cheio!", "level": "warning"})
        if process_count > 250: # Aumentei um pouco para o Windows não apitar por bobeira
            alerts.append({"id": 4, "message": "Muitos processos rodando!", "level": "info"})
        
        # Monitoramento de Bateria (O "Nobreak" do seu notebook)
        battery = psutil.sensors_battery()
        if battery and not battery.power_plugged and battery.percent < 20:
            alerts.append({"id": 5, "message": "Energia externa desconectada!", "level": "error"})
            
        # Monitoramento de Temperatura (Portável para Linux/Proxmox)
        if hasattr(psutil, "sensors_temperatures"):
            try:
                temps = psutil.sensors_temperatures()
                if temps:
                    core_temp = list(temps.values())[0][0].current
                    if core_temp > 80:
                        alerts.append({"id": 6, "message": f"Temperatura Alta: {core_temp}°C", "level": "error"})
            except Exception:
                pass

        return Response({
            "hostname": platform.node(),
            "cpu": cpu_usage,
            "ram_percent": ram.percent,
            "ram_total": round(ram.total / (1024**3), 1),
            "disk_percent": disk_usage,
            "services_count": process_count,
            "alerts": alerts,
            "alerts_count": len(alerts),
            "status": "online"
        })


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class ServiceListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        services = Service.objects.all()
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)
    

class ServiceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        services = Service.objects.all()
        data = []

        for service in services:
            service_data = ServiceSerializer(service).data
            # Extrai o IP/Host da URL (remove http:// e portas)
            host = service.url.split("//")[-1].split(":")[0].split("/")[0]
            
            # Comando de ping diferente para Windows e Linux
            param = '-n' if platform.system().lower() == 'windows' else '-c'
            command = f"ping {param} 1 {host}"
            
            # Executa o ping e verifica o retorno (0 significa sucesso)
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
            send_magic_packet(mac) # Dispara o pacote para ligar o PC
            return Response({"message": "Magic packet sent!"})
        return Response({"error": "MAC required"}, status=400)
    

class DockerMonitorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Forçamos a conexão via TCP com timeout de 2 segundos
            #client = docker.DockerClient(base_url='tcp://localhost:2375', timeout=2)
            
            # Testa a conexão antes de prosseguir
            #client.ping() 

            containers = client.containers.list(all=True)
            container_data = []

            for container in containers:
                mem_percent = 0.0
                
                # SÓ tenta ler stats se o container estiver rodando
                # Isso evita o Erro 500 em containers parados
                if container.status == 'running':
                    try:
                        # O segredo: stats básicas sem processamento pesado
                        stats = container.stats(stream=False)
                        
                        mem_stats = stats.get('memory_stats', {})
                        usage = mem_stats.get('usage', 0)
                        limit = mem_stats.get('limit', 1)
                        
                        if limit > 0:
                            mem_percent = round((usage / limit) * 100, 2)
                    except:
                        mem_percent = 0.0

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
            # Retorna o erro real para podermos debugar no Front
            return Response({"error": str(e)}, status=500)
        

class DockerActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        container_id = request.data.get('container_id')
        action = request.data.get('action') # 'restart', 'start', 'stop'
        
        try:
            client = docker.from_env()
            container = client.containers.get(container_id)
            
            if action == 'restart':
                container.restart()
            elif action == 'stop':
                container.stop()
            elif action == 'start':
                container.start()
                
            return Response({"message": f"Container {action}ed successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=500)