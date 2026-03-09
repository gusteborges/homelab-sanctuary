import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_SERVICES } from "@/data/mockData";
import StatusDot from "@/components/StatusDot";
import {
  Film, Cloud, Gamepad2, BarChart3, Container, Shield, Home, Activity, ExternalLink,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Film, Cloud, Gamepad2, BarChart3, Container, Shield, Home, Activity,
};

const ServicesPage = () => {
  const categories = [...new Set(MOCK_SERVICES.map((s) => s.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">Services</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your homelab services</p>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="space-y-3">
          <h2 className="text-sm font-mono font-semibold text-muted-foreground uppercase tracking-wider">{cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_SERVICES.filter((s) => s.category === cat).map((service) => {
              const Icon = iconMap[service.icon] || Activity;
              return (
                <Card key={service.id} className="glow-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-mono">{service.name}</CardTitle>
                        </div>
                      </div>
                      <StatusDot status={service.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs mb-3">{service.description}</CardDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted-foreground capitalize px-2 py-0.5 rounded bg-muted">
                        {service.status}
                      </span>
                      {service.url && (
                        <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary hover:text-primary" asChild>
                          <a href={service.url} target="_blank" rel="noopener noreferrer">
                            Open <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServicesPage;
