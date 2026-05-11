import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications(50);
  const { mutate: markRead } = useMarkAsRead();
  const { mutate: markAll, isPending: isMarkingAll } = useMarkAllAsRead();
  const { mutate: del } = useDeleteNotification();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="size-5" />
          <h1 className="text-xl font-semibold">Bildirimler</h1>
          {unreadCount > 0 && (
            <span className="text-xs bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 font-medium">
              {unreadCount} okunmamış
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll()}
            disabled={isMarkingAll}
            className="gap-1.5"
          >
            <Check className="size-4" />
            Tümünü okundu işaretle
          </Button>
        )}
      </div>

      {/* Liste */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Bell className="size-10 opacity-30" />
            <p>Henüz bildirim yok</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-4 px-5 py-4 transition-colors",
                  !n.is_read && "bg-muted/30",
                )}
              >
                {/* Okunmamış nokta */}
                <div className="mt-1 shrink-0 w-2 h-2">
                  {!n.is_read && (
                    <span className="block w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>

                {/* İçerik */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Aksiyonlar */}
                <div className="flex items-center gap-1 shrink-0">
                  {!n.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => markRead(n.id)}
                      aria-label="Okundu işaretle"
                    >
                      <Check className="size-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => del(n.id)}
                    aria-label="Sil"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}