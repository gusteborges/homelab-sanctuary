import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusDot from "@/components/StatusDot";
import UsageBar from "@/components/UsageBar";
import { API_BASE_URL } from "@/lib/api";
import { Activity, Layers, AlertTriangle, Cpu, HardDrive } from "lucide-react";

const DashboardPage = () => {
  const { token } = useAuth();
  
  const [data, setData] = useState({ 
    cpu: 0, 
    ram_percent: 0, 
    ram_total: 0, 
    disk_percent: 0,
    services_count: 0,
    alerts_count: 0,
    hostname: "Loading...",
    status: "loading" 
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/monitor/`, {
          headers: { "Authorization": `Token ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 15000);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="glow-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Processor</p>
              <p className="text-2xl font-mono font-bold mt-1">{data.cpu}%</p>
            </div>
            <div className="p-2 rounded-md bg-primary/10"><Cpu className="h-5 w-5 text-primary" /></div>
          </CardContent>
        </Card>

        <Card className="glow-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Disk Health</p>
              <p className="text-2xl font-mono font-bold mt-1">{data.disk_percent}%</p>
            </div>
            <div className="p-2 rounded-md bg-primary/10"><HardDrive className="h-5 w-5 text-primary" /></div>
          </CardContent>
        </Card>

        <Card className="glow-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Alerts</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-mono flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <StatusDot status={data.status === "online" ? "online" : "offline"} />
                <div>
                  <p className="text-sm font-mono font-medium">{data.hostname}</p>
                  <p className="text-xs text-muted-foreground">{data.ram_total}GB RAM detected</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-mono flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageBar value={data.cpu} label="CPU" />
            <UsageBar value={data.ram_percent} label="RAM Memory" />
            <UsageBar value={data.disk_percent} label="Storage" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
