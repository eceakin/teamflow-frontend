import api from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type { Task, Comment, Attachment } from "@/types/task";

// ─── Task API ─────────────────────────────────────────────────

export const getTasksApi = (
  projectId: string,
  params?: Record<string, string>,
) => api.get<ApiResponse<Task[]>>(`/projects/${projectId}/tasks`, { params });

export const getTaskApi = (taskId: string) =>
  api.get<ApiResponse<Task>>(`/tasks/${taskId}`);

export const createTaskApi = (
  projectId: string,
  payload: {
    title: string;
    description?: string;
    status?: Task["status"];
    priority?: Task["priority"];
    due_date?: string;
    sprint_id?: string;
  },
) => api.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, payload);

export const updateTaskApi = (
  taskId: string,
  payload: {
    title?: string;
    description?: string;
    status?: Task["status"];
    priority?: Task["priority"];
    due_date?: string | null;
    sprint_id?: string | null;
  },
) => api.put<ApiResponse<Task>>(`/tasks/${taskId}`, payload);

export const updateTaskStatusApi = (taskId: string, status: Task["status"]) =>
  api.patch<ApiResponse<Task>>(`/tasks/${taskId}/status`, { status });

export const deleteTaskApi = (taskId: string) => api.delete(`/tasks/${taskId}`);

// ─── Assignee API ─────────────────────────────────────────────

export const addAssigneeApi = (taskId: string, userId: string) =>
  api.post(`/tasks/${taskId}/assignees`, { user_id: userId });

export const removeAssigneeApi = (taskId: string, userId: string) =>
  api.delete(`/tasks/${taskId}/assignees/${userId}`);

// ─── Label API ────────────────────────────────────────────────

export const addLabelToTaskApi = (taskId: string, labelId: string) =>
  api.post(`/tasks/${taskId}/labels`, { label_id: labelId });

export const removeLabelFromTaskApi = (taskId: string, labelId: string) =>
  api.delete(`/tasks/${taskId}/labels/${labelId}`);

// ─── Comment API ──────────────────────────────────────────────

export const getCommentsApi = (taskId: string) =>
  api.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`);

export const createCommentApi = (
  taskId: string,
  payload: { content: string; parent_id?: string },
) => api.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, payload);

export const updateCommentApi = (commentId: string, content: string) =>
  api.put<ApiResponse<Comment>>(`/comments/${commentId}`, { content });

export const deleteCommentApi = (commentId: string) =>
  api.delete(`/comments/${commentId}`);

// ─── Attachment API ───────────────────────────────────────────

export const getAttachmentsApi = (taskId: string) =>
  api.get<ApiResponse<Attachment[]>>(`/tasks/${taskId}/attachments`);
