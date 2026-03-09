from django.contrib import admin
from .models import RemoteMachine, Service

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_active')
    list_filter = ('category', 'is_active')


@admin.register(RemoteMachine)
class RemoteMachineAdmin(admin.ModelAdmin):
    # Colunas que vão aparecer na listagem
    list_display = ('name', 'ip_address', 'is_gaming_pc') 
    # Filtros na lateral direita
    list_filter = ('is_gaming_pc',)
    # Campos de busca
    search_fields = ('name', 'ip_address', 'mac_address')