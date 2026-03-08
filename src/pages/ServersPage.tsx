import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SERVERS } from "@/data/mockData";
import StatusDot from "@/components/StatusDot";
import UsageBar from "@/components/UsageBar";
import { Server } from "lucide-react";

const ServersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">Servers</h1>
        <p className="text-sm text-muted-foreground mt-1">All machines in your homelab</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {MOCK_SERVERS.map((server) => (
          <Card key={server.id} className="glow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Server className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-mono">{server.hostname}</CardTitle>
                    <p className="text-xs text-muted-foreground">{server.os}</p>
                  </div>
                </div>
                <StatusDot status={server.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP</span>
                  <span className="font-mono text-foreground">{server.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="font-mono text-foreground">{server.uptime}</span>
                </div>
              </div>
              {server.status !== "offline" && (
                <div className="space-y-2 pt-1">
                  <UsageBar value={server.cpu} label="CPU" />
                  <UsageBar value={server.ram} label="RAM" />
                  <UsageBar value={server.disk} label="Disk" />
                </div>
              )}
              {server.status === "offline" && (
                <p className="text-xs text-destructive font-mono text-center py-2">● Server Offline</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServersPage;
