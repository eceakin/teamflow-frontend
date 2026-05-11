import api from "@/lib/axios";
import type { ApiResponse, Notification } from "@/types";

export interface NotificationsResponse {
    notifications: Notification[];
    unread_count: number;
}

export const getNotificationsApi = (params?: {limit?: number; unread?: boolean}) => 
    api.get<ApiResponse<NotificationsResponse>>("/notifications", { params });

export const markAsReadApi = (id: string) =>
    api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);

export const markAllAsReadApi = () =>
    api.patch<ApiResponse<null>>("/notifications/read-all");

export const deleteNotificationApi = (id: string) =>
    api.delete<ApiResponse<null>>(`/notifications/${id}`);