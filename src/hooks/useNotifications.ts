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
      getNotificationsApi({ limit }).then((r: {data:{data: NotificationsResponse}}) => r.data.data),
    refetchInterval: 30_000, // 30 saniyede bir polling
    staleTime: 10_000,
  });
}

export function useUnreadCount() {
  const { data } = useNotifications(1);
  return data?.unread_count ?? 0;
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