import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Activity, Monitor, Shield, Database, Layout, Code } from "lucide-react";
import StatusDot from "@/components/StatusDot";
import { API_BASE_URL } from "@/lib/api";

const iconMap: Record<string, any> = {
  GAMING: Monitor,
  MEDIA: Activity,
  STORAGE: Database,
  MONITORING: Activity,
  MANAGEMENT: Layout,
  NETWORK: Shield,
  CODE: Code,
};

const ServicesPage = () => {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/`, {
        headers: { "Authorization": `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (err) {
      console.error("Services fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 30000); 
    return () => clearInterval(interval);
  }, [token]);

  const categories = [...new Set(services.map((s: any) => s.category))];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">Services</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your homelab infrastructure</p>
      </div>

      {loading && services.length === 0 ? (
        <p className="font-mono text-sm animate-pulse">Scanning infrastructure...</p>
      ) : (
        categories.map((cat) => (
          <div key={cat} className="space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground ml-1">
              {cat}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services
                .filter((s: any) => s.category === cat)
                .map((service: any) => {
                  const Icon = iconMap[service.category] || Activity;
                  return (
                    <Card key={service.id} className="glow-card overflow-hidden group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-sm font-mono font-bold text-foreground">
                                {service.name}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {service.description}
                              </p>
                            </div>
                          </div>
                          <StatusDot status={service.is_active ? "online" : "offline"} />
                        </div>
                        
                        <div className="flex items-center justify-between mt-6">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            service.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-muted border-border text-muted-foreground'
                          }`}>
                            {service.is_active ? 'ONLINE' : 'OFFLINE'}
                          </span>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs font-mono hover:text-primary gap-2"
                            onClick={() => window.open(service.url, "_blank")}
                          >
                            Open <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ServicesPage;
