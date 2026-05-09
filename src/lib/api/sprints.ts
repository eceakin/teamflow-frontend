import api from "@/lib/axios";
import type { ApiResponse } from "@/types";

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "planning" | "active" | "completed";
  created_at: string;
}

export const getSprintsApi = (projectId: string) =>
  api.get<ApiResponse<Sprint[]>>(`/projects/${projectId}/sprints`);

export const getSprintApi = (sprintId: string) =>
  api.get<ApiResponse<Sprint>>(`/sprints/${sprintId}`);

export const createSprintApi = (
  projectId: string,
  payload: {
    name: string;
    goal?: string;
    start_date?: string;
    end_date?: string;
  },
) => api.post<ApiResponse<Sprint>>(`/projects/${projectId}/sprints`, payload);

export const updateSprintApi = (
  sprintId: string,
  payload: {
    name?: string;
    goal?: string;
    start_date?: string;
    end_date?: string;
  },
) => api.put<ApiResponse<Sprint>>(`/sprints/${sprintId}`, payload);

export const startSprintApi = (sprintId: string) =>
  api.patch<ApiResponse<Sprint>>(`/sprints/${sprintId}/start`);

export const endSprintApi = (sprintId: string) =>
  api.patch<ApiResponse<Sprint>>(`/sprints/${sprintId}/end`);

export const addTaskToSprintApi = (sprintId: string, taskId: string) =>
  api.post(`/sprints/${sprintId}/tasks/${taskId}`);

export const removeTaskFromSprintApi = (sprintId: string, taskId: string) =>
  api.delete(`/sprints/${sprintId}/tasks/${taskId}`);
