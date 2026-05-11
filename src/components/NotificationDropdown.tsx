import { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { data } = useNotifications(5);
  const { mutate: markRead } = useMarkAsRead();
  const { mutate: markAll } = useMarkAllAsRead();
  const { mutate: del } = useDeleteNotification();
  const navigate = useNavigate();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

  return (
    <div className="relative">
      {/* Zil ikonu */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen((o) => !o)}
        aria-label="Bildirimler"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Dışarı tıklayınca kapat */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 z-20 rounded-xl border bg-popover shadow-lg overflow-hidden">
            {/* Başlık */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">Bildirimler</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAll()}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Check className="size-3" />
                  Tümünü okundu işaretle
                </button>
              )}
            </div>

            {/* Liste */}
            <div className="divide-y max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Bildirim yok
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                      !n.is_read && "bg-muted/30",
                    )}
                  >
                    {!n.is_read && (
                      <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-primary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(n.created_at).toLocaleString("tr-TR")}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!n.is_read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Okundu işaretle"
                        >
                          <Check className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => del(n.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Sil"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Alt link */}
            <div className="border-t px-4 py-2">
              <button
                onClick={() => { navigate("/notifications"); setOpen(false); }}
                className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
              >
                Tüm bildirimleri gör
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}