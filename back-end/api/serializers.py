from rest_framework import serializers
from .models import User
from .models import RemoteMachine

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'is_active', 'date_joined']

class RemoteMachineSerializer(serializers.ModelSerializer):
    # Campo calculado para o React saber se a máquina está online via Ping
    is_online = serializers.SerializerMethodField()

    class Meta:
        model = RemoteMachine
        fields = '__all__'

    def get_is_online(self, obj):
        import os, platform
        param = '-n' if platform.system().lower() == 'windows' else '-c'
        command = f"ping {param} 1 {obj.ip_address} > nul"
        return os.system(command) == 0