from django.urls import path
from .views import (
    CustomAuthToken, DockerActionView, DockerMonitorView, 
    RemoteMachineListView, ServiceListView, SystemMonitorView, 
    WakeOnLanView, NotificationListView
)

urlpatterns = [
    path('login/', CustomAuthToken.as_view(), name='api_login'),
    path('monitor/', SystemMonitorView.as_view(), name='system_monitor'),
    path('services/', ServiceListView.as_view(), name='services_list'),
    path('remote-machines/', RemoteMachineListView.as_view(), name='remote_machines'),
    path('wake-on-lan/', WakeOnLanView.as_view(), name='wake_on_lan'),
    path('containers/', DockerMonitorView.as_view(), name='docker_monitor'),
    path('containers/action/', DockerActionView.as_view(), name='docker_action'),
    path('notifications/', NotificationListView.as_view(), name='notifications_list'),
]
