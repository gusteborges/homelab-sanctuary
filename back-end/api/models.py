from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Definimos as roles que você já previu no frontend React
    ROLE_CHOICES = (
        ('admin', 'Administrator'),
        ('guest', 'Guest/Family'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='guest')

    def __str__(self):
        return f"{self.username} ({self.role})"
    

class Service(models.Model):
    # Categorias para organizar no Front (MEDIA, GAMING, STORAGE, etc)
    CATEGORY_CHOICES = [
        ('MEDIA', 'Media'),
        ('STORAGE', 'Storage'),
        ('GAMING', 'Gaming'),
        ('MONITORING', 'Monitoring'),
        ('MANAGEMENT', 'Management'),
	('CODE', 'Code')
    ]

    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='MEDIA')
    url = models.URLField(help_text="URL para abrir o serviço (ex: IP do seu PC Gamer)")
    icon = models.CharField(max_length=50, default="Activity", help_text="Nome do ícone Lucide")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    


class RemoteMachine(models.Model):
    name = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField()
    mac_address = models.CharField(max_length=17)
    protocol = models.CharField(max_length=50, default="RDP")
    # Trocamos URLField por CharField para aceitar protocolos customizados
    url = models.CharField(max_length=255, blank=True, null=True) 
    is_gaming_pc = models.BooleanField(default=False)

    def __str__(self):
        return self.name
