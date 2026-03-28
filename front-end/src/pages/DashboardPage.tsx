import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusDot from "@/components/StatusDot";
import UsageBar from "@/components/UsageBar";
import { Activity, Layers, AlertTriangle, Cpu, HardDrive } from "lucide-react";

const DashboardPage = () => {
  const { token } = useAuth();
  
  // Estado único para todos os dados que vêm do Django
  const [data, setData] = useState({ 
    cpu: 0, 
    ram_percent: 0, 
    ram_total: 0, 
    disk_percent: 0,
    services_count: 0,
    alerts_count: 0,
    alerts: [],
    hostname: "Carregando...",
    status: "loading" 
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await fetch("http://192.168.100.100:8000/api/monitor/", {
          headers: { "Authorization": `Token ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (err) {
        console.error("Erro ao conectar com o Homelab Backend:", err);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 15000); // Atualiza tudo a cada 15s
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Node: <span className="text-primary">{data.hostname}</span>
        </p>
      </div>

      {/* Stats Grid - TOTALMENTE REAL AGORA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="glow-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Processador</p>
              <p className="text-2xl font-mono font-bold mt-1">{data.cpu}%</p>
            </div>
            <div className="p-2 rounded-md bg-primary/10"><Cpu className="h-5 w-5 text-primary" /></div>
          </CardContent>
        </Card>

        <Card className="glow-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Processos (PIDs)</p>
              <p className="text-2xl font-mono font-bold mt-1">{data.services_count}</p>
            </div>
            <div className="p-2 rounded-md bg-primary/10"><Layers className="h-5 w-5 text-primary" /></div>
          </CardContent>
        </Card>

        <Card className="glow-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Alertas Ativos</p>
              <p className={`text-2xl font-mono font-bold mt-1 ${data.alerts_count > 0 ? 'text-destructive' : ''}`}>
                {data.alerts_count}
              </p>
            </div>
            <div className={`p-2 rounded-md ${data.alerts_count > 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
              <AlertTriangle className={`h-5 w-5 ${data.alerts_count > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alertas Dinâmica */}
      {data.alerts.length > 0 && (
        <div className="grid gap-2">
          {data.alerts.map((alert: any) => (
            <div key={alert.id} className="p-3 border border-destructive/50 bg-destructive/5 rounded-md flex items-center gap-2 text-destructive text-sm font-mono">
              <AlertTriangle className="h-4 w-4" /> {alert.message}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-mono flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <StatusDot status={data.status === "online" ? "online" : "offline"} />
                <div>
                  <p className="text-sm font-mono font-medium">{data.hostname}</p>
                  <p className="text-xs text-muted-foreground">{data.ram_total}GB de RAM Detectados</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-mono flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" /> Recursos em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageBar value={data.cpu} label="CPU" />
            <UsageBar value={data.ram_percent} label="Memória RAM" />
            <UsageBar value={data.disk_percent} label="Disco Principal" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
