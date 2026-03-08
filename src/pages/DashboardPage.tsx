import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SERVERS, MOCK_SERVICES, MOCK_NOTIFICATIONS } from "@/data/mockData";
import StatusDot from "@/components/StatusDot";
import UsageBar from "@/components/UsageBar";
import { Server, Activity, Layers, AlertTriangle, Cpu, HardDrive, MemoryStick } from "lucide-react";

const DashboardPage = () => {
  const onlineServers = MOCK_SERVERS.filter((s) => s.status === "online").length;
  const runningServices = MOCK_SERVICES.filter((s) => s.status === "running").length;
  const alerts = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const avgCpu = Math.round(
    MOCK_SERVERS.filter((s) => s.status !== "offline").reduce((a, s) => a + s.cpu, 0) /
      MOCK_SERVERS.filter((s) => s.status !== "offline").length
  );
  const avgRam = Math.round(
    MOCK_SERVERS.filter((s) => s.status !== "offline").reduce((a, s) => a + s.ram, 0) /
      MOCK_SERVERS.filter((s) => s.status !== "offline").length
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">HomeLab infrastructure overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Servers</p>
                <p className="text-2xl font-mono font-bold text-foreground mt-1">
                  {onlineServers}/{MOCK_SERVERS.length}
                </p>
              </div>
              <div className="p-2 rounded-md bg-primary/10">
                <Server className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Services</p>
                <p className="text-2xl font-mono font-bold text-foreground mt-1">
                  {runningServices}/{MOCK_SERVICES.length}
                </p>
              </div>
              <div className="p-2 rounded-md bg-primary/10">
                <Layers className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg CPU</p>
                <p className="text-2xl font-mono font-bold text-foreground mt-1">{avgCpu}%</p>
              </div>
              <div className="p-2 rounded-md bg-primary/10">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Alerts</p>
                <p className="text-2xl font-mono font-bold text-foreground mt-1">{alerts}</p>
              </div>
              <div className="p-2 rounded-md bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-mono flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Server Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_SERVERS.map((server) => (
              <div key={server.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <StatusDot status={server.status} />
                  <div>
                    <p className="text-sm font-mono font-medium text-foreground">{server.hostname}</p>
                    <p className="text-xs text-muted-foreground">{server.ip}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{server.uptime}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-mono flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_SERVERS.filter((s) => s.status !== "offline").map((server) => (
              <div key={server.id} className="space-y-2 p-3 rounded-md bg-muted/30 border border-border/50">
                <p className="text-sm font-mono font-medium text-foreground">{server.hostname}</p>
                <UsageBar value={server.cpu} label="CPU" />
                <UsageBar value={server.ram} label="RAM" />
                <UsageBar value={server.disk} label="Disk" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
