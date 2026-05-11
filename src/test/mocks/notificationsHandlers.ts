import { http, HttpResponse } from "msw";
import type { Notification } from "@/types";

const BASE = "http://localhost:3000/api";

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    user_id: "user-uuid-1",
    type: "task_assigned",
    message: "Sana 'Login sayfası tasarımı' görevi atandı.",
    is_read: false,
    entity_type: "task",
    entity_id: "task-uuid-1",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "notif-2",
    user_id: "user-uuid-1",
    type: "comment_added",
    message: "testuser görevine yorum ekledi.",
    is_read: false,
    entity_type: "task",
    entity_id: "task-uuid-1",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "notif-3",
    user_id: "user-uuid-1",
    type: "sprint_started",
    message: "Sprint 1 başlatıldı.",
    is_read: true,
    entity_type: "sprint",
    entity_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export const notificationHandlers = [
  http.get(`${BASE}/notifications`, () =>
    HttpResponse.json({
      success: true,
      message: "İşlem başarılı",
      data: {
        notifications: MOCK_NOTIFICATIONS,
        unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length,
      },
    }),
  ),

  http.patch(`${BASE}/notifications/:id/read`, ({ params }) => {
    const n = MOCK_NOTIFICATIONS.find((x) => x.id === params.id);
    if (n) n.is_read = true;
    return HttpResponse.json({ success: true, message: "Okundu", data: n ?? null });
  }),

  http.patch(`${BASE}/notifications/read-all`, () => {
    MOCK_NOTIFICATIONS.forEach((n) => (n.is_read = true));
    return HttpResponse.json({ success: true, message: "Tümü okundu", data: null });
  }),

  http.delete(`${BASE}/notifications/:id`, ({ params }) => {
    const idx = MOCK_NOTIFICATIONS.findIndex((x) => x.id === params.id);
    if (idx !== -1) MOCK_NOTIFICATIONS.splice(idx, 1);
    return HttpResponse.json({ success: true, message: "Silindi", data: null });
  }),
];