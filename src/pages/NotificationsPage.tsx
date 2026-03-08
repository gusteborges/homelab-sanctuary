import { Card, CardContent } from "@/components/ui/card";
import { MOCK_NOTIFICATIONS } from "@/data/mockData";
import { Bell, AlertCircle, AlertTriangle, Info } from "lucide-react";

const iconMap = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  error: "text-destructive",
  warning: "text-warning",
  info: "text-primary",
};

const NotificationsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">System alerts and events</p>
      </div>

      <div className="space-y-2">
        {MOCK_NOTIFICATIONS.map((notif) => {
          const Icon = iconMap[notif.type];
          return (
            <Card key={notif.id} className={notif.read ? "opacity-60" : "glow-card"}>
              <CardContent className="p-4 flex items-center gap-4">
                <Icon className={`h-5 w-5 shrink-0 ${colorMap[notif.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{notif.message}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{notif.timestamp}</p>
                </div>
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPage;
