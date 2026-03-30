import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusDot from "@/components/StatusDot";
import { API_BASE_URL } from "@/lib/api";
import { MonitorPlay, Gamepad2, Monitor, Power, Wifi, RefreshCw } from "lucide-react";

const RemoteAccessPage = () => {
  const { token } = useAuth();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waking, setWaking] = useState<string | null>(null);

  const fetchMachines = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/remote-machines/`, {
        headers: { "Authorization": `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMachines(data);
      }
    } catch (err) {
      console.error("Remote machines error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleWake = async (mac: string, name: string) => {
    setWaking(name);
    try {
      const response = await fetch(`${API_BASE_URL}/wake-on-lan/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Token ${token}` 
        },
        body: JSON.stringify({ mac_address: mac })
      });
      if (response.ok) {
        alert(`Wake command sent to ${name}!`);
      }
    } catch (err) {
      alert("Error sending wake command.");
    } finally {
      setWaking(null);
    }
  };

  const gamingPC = machines.find((m: any) => m.is_gaming_pc) || (machines.length > 0 ? machines[0] : null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-mono text-foreground">Remote Access</h1>
          <p className="text-sm text-muted-foreground mt-1">Control your infrastructure remotely</p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchMachines} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {machines.length === 0 && !loading ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground font-mono">No machines registered in the system.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Gamepad2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-mono">Game Streaming</CardTitle>
                  <CardDescription>Stream via Moonlight/Sunshine</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-md bg-muted/30 border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Host</span>
                  <span className="text-sm font-mono text-foreground">{gamingPC?.name || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    <StatusDot status={gamingPC?.is_online ? "online" : "offline"} />
                    <span className="text-sm font-mono">{gamingPC?.is_online ? "Available" : "Offline"}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1 gap-2" 
                  disabled={!gamingPC?.is_online}
                  onClick={() => window.open(`moonlight://`)}
                >
                  <MonitorPlay className="h-4 w-4" /> Launch Stream
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleWake(gamingPC?.mac_address, gamingPC?.name)}
                  disabled={gamingPC?.is_online || waking === gamingPC?.name || !gamingPC}
                >
                  <Power className={`h-4 w-4 ${waking === gamingPC?.name ? 'animate-pulse' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-mono">Remote Desktop</CardTitle>
                  <CardDescription>RDP/VNC/SSH Access</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {machines.map((machine: any) => (
                <div key={machine.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <StatusDot status={machine.is_online ? "online" : "offline"} />
                    <div>
                      <p className="text-sm font-mono font-medium">{machine.name}</p>
                      <p className="text-xs text-muted-foreground">{machine.ip_address} · {machine.protocol}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => window.open(machine.url || `rdp://${machine.ip_address}`)}
                    disabled={!machine.is_online}
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glow-card md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-mono flex items-center gap-2">
                <Power className="h-5 w-5 text-primary" /> Wake-on-LAN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {machines.map((device: any) => (
                  <div key={device.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border">
                    <div className="flex items-center gap-2">
                      <StatusDot status={device.is_online ? "online" : "offline"} />
                      <div>
                        <p className="text-sm font-mono">{device.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{device.mac_address}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs gap-1" 
                      disabled={device.is_online || waking === device.name}
                      onClick={() => handleWake(device.mac_address, device.name)}
                    >
                      {waking === device.name ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Wifi className="h-3 w-3" />} Wake
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RemoteAccessPage;
