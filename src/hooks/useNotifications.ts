import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { NotificationsResponse } from "@/lib/api/notifications";
import {
  getNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
  deleteNotificationApi,
} from "@/lib/api/notifications";
import type { Notification } from "@/types";

export function useNotifications(limit = 20) {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () =>
      getNotificationsApi({ limit }).then(
        (r: { data: { data: NotificationsResponse } }) => r.data.data,
      ),
    // Bildirimlerin düşme hızını anlık hissiyat için 30 saniyeden 5 saniyeye indirdik
    refetchInterval: 5_000,
    refetchOnWindowFocus: true, // Sekmeye geri dönüldüğünde anında yeniler
    staleTime: 0,
  });
}

export function useUnreadCount() {
  const { data } = useNotifications(1);
  // BURASI DÜZELTİLDİ: unread_count -> unreadCount
  return (data as any)?.unreadCount ?? 0;
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAsReadApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllAsReadApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotificationApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export type { Notification };
