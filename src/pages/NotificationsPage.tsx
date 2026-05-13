import { Bell, Check, Trash2, Mail } from "lucide-react";
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
  const unreadCount = data?.unreadCount ?? 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="size-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Başlık Alanı */}
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <nav className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Hesap / Kişisel
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Bildirimler
            </h1>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-blue-600 text-white rounded-sm px-2 py-0.5 font-black uppercase tracking-tighter">
                {unreadCount} YENİ
              </span>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAll()}
            disabled={isMarkingAll}
            className="text-blue-600 hover:bg-blue-50 text-xs font-bold gap-2"
          >
            <Check className="size-3.5" />
            TÜMÜNÜ OKUNDU İŞARETLE
          </Button>
        )}
      </div>

      {/* Liste Kartı */}
      <Card className="border-kanban-border shadow-jira-card bg-white overflow-hidden">
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center">
                <Bell className="size-8 text-gray-200" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                  Her şey güncel
                </p>
                <p className="text-xs text-muted-foreground">
                  Henüz yeni bir bildirim almadınız.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-4 px-6 py-4 transition-all group relative",
                    !n.is_read ? "bg-blue-50/40" : "hover:bg-gray-50/50",
                  )}
                >
                  {/* Mavi Durum Çizgisi (Okunmamışlar için) */}
                  {!n.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                  )}

                  <div className="mt-1 shrink-0">
                    <div
                      className={cn(
                        "size-8 rounded-full flex items-center justify-center border",
                        !n.is_read
                          ? "bg-white border-blue-200 text-blue-600"
                          : "bg-gray-50 border-gray-100 text-gray-400",
                      )}
                    >
                      <Mail className="size-4" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        !n.is_read
                          ? "font-semibold text-gray-900"
                          : "text-gray-600",
                      )}
                    >
                      {/* n.message YERİNE n.content KULLANILDI - SORUNUN ÇÖZÜMÜ BURADA */}
                      {n.content}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {new Date(n.created_at).toLocaleString("tr-TR")}
                    </p>
                  </div>

                  {/* Hızlı Aksiyonlar */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                        onClick={() => markRead(n.id)}
                        title="Okundu işaretle"
                      >
                        <Check className="size-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => del(n.id)}
                      title="Sil"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
