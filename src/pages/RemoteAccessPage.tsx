import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusDot from "@/components/StatusDot";
import { MonitorPlay, Gamepad2, Monitor, Power, Wifi } from "lucide-react";

const RemoteAccessPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">Remote Access</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect to your machines remotely</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Game Streaming */}
        <Card className="glow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Gamepad2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-mono">Game Streaming</CardTitle>
                <CardDescription>Stream games from your main PC</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-md bg-muted/30 border border-border/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Host</span>
                <span className="text-sm font-mono text-foreground">gaming-pc (192.168.1.50)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  <StatusDot status="online" />
                  <span className="text-sm font-mono text-foreground">Available</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Protocol</span>
                <span className="text-sm font-mono text-foreground">Moonlight / NVIDIA GameStream</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 gap-2">
                <MonitorPlay className="h-4 w-4" /> Launch Stream
              </Button>
              <Button variant="outline" size="icon">
                <Power className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Your sister can use this to stream games from your main PC via Moonlight client.
            </p>
          </CardContent>
        </Card>

        {/* Remote Desktop */}
        <Card className="glow-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Monitor className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-mono">Remote Desktop</CardTitle>
                <CardDescription>Access machines via RDP/VNC</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "gaming-pc", ip: "192.168.1.50", status: "online" as const, protocol: "RDP" },
              { name: "proxmox-01", ip: "192.168.1.10", status: "online" as const, protocol: "VNC" },
              { name: "docker-host", ip: "192.168.1.30", status: "warning" as const, protocol: "SSH" },
            ].map((machine) => (
              <div key={machine.name} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <StatusDot status={machine.status} />
                  <div>
                    <p className="text-sm font-mono font-medium text-foreground">{machine.name}</p>
                    <p className="text-xs text-muted-foreground">{machine.ip} · {machine.protocol}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  Connect
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Wake-on-LAN */}
        <Card className="glow-card md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Power className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-mono">Wake-on-LAN</CardTitle>
                <CardDescription>Start machines remotely</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: "gaming-pc", mac: "AA:BB:CC:DD:EE:01", status: "online" as const },
                { name: "backup-srv", mac: "AA:BB:CC:DD:EE:02", status: "offline" as const },
                { name: "docker-host", mac: "AA:BB:CC:DD:EE:03", status: "online" as const },
              ].map((device) => (
                <div key={device.name} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2">
                    <StatusDot status={device.status} />
                    <div>
                      <p className="text-sm font-mono text-foreground">{device.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{device.mac}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs gap-1" disabled={device.status === "online"}>
                    <Wifi className="h-3 w-3" /> Wake
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RemoteAccessPage;
