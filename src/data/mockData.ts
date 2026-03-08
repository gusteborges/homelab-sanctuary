export interface Server {
  id: string;
  hostname: string;
  ip: string;
  os: string;
  uptime: string;
  cpu: number;
  ram: number;
  disk: number;
  status: "online" | "offline" | "warning";
}

export interface Service {
  id: string;
  name: string;
  description: string;
  status: "running" | "stopped" | "degraded";
  url?: string;
  icon: string;
  category: string;
}

export interface Notification {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  timestamp: string;
  read: boolean;
}

export const MOCK_SERVERS: Server[] = [
  { id: "1", hostname: "proxmox-01", ip: "192.168.1.10", os: "Proxmox VE 8.1", uptime: "42d 7h", cpu: 34, ram: 62, disk: 45, status: "online" },
  { id: "2", hostname: "nas-synology", ip: "192.168.1.20", os: "DSM 7.2", uptime: "120d 3h", cpu: 12, ram: 38, disk: 78, status: "online" },
  { id: "3", hostname: "gaming-pc", ip: "192.168.1.50", os: "Windows 11", uptime: "2d 14h", cpu: 8, ram: 24, disk: 55, status: "online" },
  { id: "4", hostname: "docker-host", ip: "192.168.1.30", os: "Ubuntu 22.04", uptime: "89d 12h", cpu: 45, ram: 71, disk: 32, status: "warning" },
  { id: "5", hostname: "backup-srv", ip: "192.168.1.40", os: "Debian 12", uptime: "0d 0h", cpu: 0, ram: 0, disk: 92, status: "offline" },
];

export const MOCK_SERVICES: Service[] = [
  { id: "1", name: "Plex Media Server", description: "Stream movies, TV shows, and music", status: "running", url: "http://192.168.1.20:32400", icon: "Film", category: "Media" },
  { id: "2", name: "Nextcloud", description: "Self-hosted file sync and share", status: "running", url: "http://192.168.1.30:8080", icon: "Cloud", category: "Storage" },
  { id: "3", name: "Moonlight Stream", description: "Game streaming from gaming PC", status: "running", url: "moonlight://192.168.1.50", icon: "Gamepad2", category: "Gaming" },
  { id: "4", name: "Grafana", description: "Monitoring and observability dashboards", status: "running", url: "http://192.168.1.30:3000", icon: "BarChart3", category: "Monitoring" },
  { id: "5", name: "Portainer", description: "Docker container management", status: "running", url: "http://192.168.1.30:9443", icon: "Container", category: "Management" },
  { id: "6", name: "Pi-hole", description: "Network-wide ad blocker", status: "degraded", url: "http://192.168.1.1:80", icon: "Shield", category: "Network" },
  { id: "7", name: "Home Assistant", description: "Home automation platform", status: "running", url: "http://192.168.1.5:8123", icon: "Home", category: "Automation" },
  { id: "8", name: "Uptime Kuma", description: "Self-hosted monitoring tool", status: "stopped", url: "http://192.168.1.30:3001", icon: "Activity", category: "Monitoring" },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "error", message: "backup-srv is offline", timestamp: "2 min ago", read: false },
  { id: "2", type: "warning", message: "docker-host CPU usage above 80%", timestamp: "15 min ago", read: false },
  { id: "3", type: "warning", message: "nas-synology disk usage at 78%", timestamp: "1 hour ago", read: true },
  { id: "4", type: "info", message: "Plex Media Server updated to v1.40", timestamp: "3 hours ago", read: true },
  { id: "5", type: "error", message: "Uptime Kuma service stopped", timestamp: "5 hours ago", read: false },
];
