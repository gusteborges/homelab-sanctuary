import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_SERVERS, MOCK_SERVICES } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Plus, Users, Server, Layers, Settings } from "lucide-react";
import StatusDot from "@/components/StatusDot";

const AdminPage = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-mono font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              You need admin privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your homelab configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Users */}
        <Card className="glow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Users
            </CardTitle>
            <CardDescription>Manage portal access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: "admin", role: "admin", active: true },
              { name: "sister", role: "guest", active: true },
            ].map((u) => (
              <div key={u.name} className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <StatusDot status={u.active ? "online" : "offline"} />
                  <span className="text-sm font-mono text-foreground">{u.name}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded">{u.role}</span>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2 text-xs gap-1">
              <Plus className="h-3 w-3" /> Add User
            </Button>
          </CardContent>
        </Card>

        {/* Add Service */}
        <Card className="glow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Add Service
            </CardTitle>
            <CardDescription>Register a new service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Service Name</Label>
              <Input placeholder="e.g., Jellyfin" className="h-8 text-sm font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">URL</Label>
              <Input placeholder="http://192.168.1.x:port" className="h-8 text-sm font-mono" />
            </div>
            <Button size="sm" className="w-full text-xs">Add Service</Button>
          </CardContent>
        </Card>

        {/* Add Server */}
        <Card className="glow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" /> Add Server
            </CardTitle>
            <CardDescription>Register a new machine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Hostname</Label>
              <Input placeholder="e.g., media-srv" className="h-8 text-sm font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">IP Address</Label>
              <Input placeholder="192.168.1.x" className="h-8 text-sm font-mono" />
            </div>
            <Button size="sm" className="w-full text-xs">Add Server</Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="glow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" /> System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-md bg-muted/30 border border-border/50">
              <p className="text-2xl font-mono font-bold text-foreground">{MOCK_SERVERS.length}</p>
              <p className="text-xs text-muted-foreground">Servers</p>
            </div>
            <div className="p-3 rounded-md bg-muted/30 border border-border/50">
              <p className="text-2xl font-mono font-bold text-foreground">{MOCK_SERVICES.length}</p>
              <p className="text-xs text-muted-foreground">Services</p>
            </div>
            <div className="p-3 rounded-md bg-muted/30 border border-border/50">
              <p className="text-2xl font-mono font-bold text-foreground">2</p>
              <p className="text-xs text-muted-foreground">Users</p>
            </div>
            <div className="p-3 rounded-md bg-muted/30 border border-border/50">
              <p className="text-2xl font-mono font-bold text-primary">98.7%</p>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
