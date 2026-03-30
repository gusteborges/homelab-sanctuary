from rest_framework import serializers
from .models import User, RemoteMachine, Service, Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'is_active', 'date_joined']

class RemoteMachineSerializer(serializers.ModelSerializer):
    is_online = serializers.SerializerMethodField()

    class Meta:
        model = RemoteMachine
        fields = '__all__'

    def get_is_online(self, obj):
        # A lógica real de status será movida para a View para performance (em lote)
        # Mas mantemos aqui como fallback ou campo calculado
        return getattr(obj, 'is_online', False)

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
