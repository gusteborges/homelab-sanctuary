import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UsageBar from "@/components/UsageBar";
import { Box, RefreshCw, ServerCrash, Power } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContainersPage = () => {
  const { token } = useAuth();
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchContainers = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/containers/", {
        headers: { "Authorization": `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setContainers(data);
      }
    } catch (err) {
      console.error("Erro ao carregar containers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Função para Restart, Start ou Stop
  const handleAction = async (containerId: string, action: string) => {
    setActionLoading(`${containerId}-${action}`);
    try {
      const response = await fetch("http://localhost:8000/api/containers/action/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Token ${token}` 
        },
        body: JSON.stringify({ container_id: containerId, action: action })
      });
      
      if (response.ok) {
        await fetchContainers(); // Atualiza a lista após a ação
      }
    } catch (err) {
      console.error(`Erro ao executar ${action}:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 10000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-mono text-foreground">Docker Containers</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os serviços rodando no seu notebook</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchContainers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {containers.length === 0 && !loading ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="p-10 flex flex-col items-center justify-center text-muted-foreground">
            <ServerCrash className="h-10 w-10 mb-4 opacity-20" />
            <p className="font-mono text-sm">Nenhum container encontrado ou Docker desligado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {containers.map((container: any) => (
            <Card key={container.id} className="glow-card border-border/50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-primary/10">
                      <Box className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-mono truncate max-w-[120px]">
                        {container.name}
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        ID: {container.id}
                      </p>
                    </div>
                  </div>
                  <Badge variant={container.status === 'running' ? 'default' : 'secondary'} className="text-[10px] font-mono">
                    {container.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="text-[10px] text-muted-foreground font-mono truncate">
                  Imagem: {container.image}
                </div>
                
                <UsageBar value={container.ram_percent} label="Memória RAM" />

                {/* Botões de Ação */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2 text-[10px] font-mono h-8"
                    onClick={() => handleAction(container.id, 'restart')}
                    disabled={actionLoading !== null}
                  >
                    <RefreshCw className={`h-3 w-3 ${actionLoading === `${container.id}-restart` ? 'animate-spin' : ''}`} /> 
                    RESTART
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleAction(container.id, container.status === 'running' ? 'stop' : 'start')}
                    disabled={actionLoading !== null}
                  >
                    <Power className={`h-3 w-3 ${
                      container.status === 'running' ? 'text-destructive' : 'text-emerald-500'
                    } ${actionLoading?.includes(container.id) ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContainersPage;