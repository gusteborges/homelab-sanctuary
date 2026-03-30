import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";
import { Bell, AlertCircle, AlertTriangle, Info, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, any> = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap: Record<string, string> = {
  error: "text-destructive",
  warning: "text-warning",
  info: "text-primary",
};

const NotificationsPage = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/`, {
        headers: { "Authorization": `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/notifications/`, {
        method: "POST",
        headers: { "Authorization": `Token ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-mono text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">System alerts and events</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 font-mono text-xs" onClick={markAllAsRead}>
          <CheckCheck className="h-4 w-4" /> Mark all read
        </Button>
      </div>

      <div className="space-y-2">
        {loading && notifications.length === 0 ? (
          <p className="text-sm font-mono animate-pulse">Checking system logs...</p>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-lg">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground opacity-20" />
            <p className="text-sm text-muted-foreground mt-2 font-mono">Everything looks quiet.</p>
          </div>
        ) : (
          notifications.map((notif: any) => {
            const Icon = iconMap[notif.level] || Info;
            return (
              <Card key={notif.id} className={notif.is_read ? "opacity-60" : "glow-card border-l-4 border-l-primary"}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Icon className={`h-5 w-5 shrink-0 ${colorMap[notif.level]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
