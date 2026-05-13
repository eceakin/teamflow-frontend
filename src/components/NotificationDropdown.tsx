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
  // BURASI DÜZELTİLDİ: unread_count -> unreadCount
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-gray-100 rounded-full transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell className="size-5 text-gray-600" />

        {/* Okunmamış sayı badge'i - Otomatik artar/azalır */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white animate-in zoom-in shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 z-20 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
              <span className="font-bold text-xs uppercase tracking-widest text-gray-700">
                Bildirimler
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAll()}
                  className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Check className="size-3" />
                  TÜMÜNÜ OKU
                </button>
              )}
            </div>

            <div className="divide-y max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10 font-medium">
                  Yeni bildirim yok
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors",
                      !n.is_read && "bg-blue-50/30",
                    )}
                  >
                    {!n.is_read && (
                      <span className="mt-2 shrink-0 w-2 h-2 rounded-full bg-blue-600" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs leading-snug",
                          !n.is_read
                            ? "font-bold text-gray-900"
                            : "text-gray-600",
                        )}
                      >
                        {n.content}
                      </p>
                      <p className="text-[9px] text-gray-400 mt-1 font-bold">
                        {new Date(n.created_at).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!n.is_read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-gray-400 hover:text-blue-600 p-1"
                        >
                          <Check className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => del(n.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t p-2 bg-gray-50/50">
              <button
                onClick={() => {
                  navigate("/notifications");
                  setOpen(false);
                }}
                className="text-[10px] font-bold text-gray-500 hover:text-blue-600 w-full text-center uppercase tracking-widest py-1"
              >
                Tümünü Gör
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
