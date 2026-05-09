import api from "@/lib/axios";
import type { Project, ApiResponse } from "@/types";

interface CreateProjectPayload {
  title: string;
  description?: string;
}

export const getProjectsApi = () =>
  api.get<ApiResponse<Project[]>>("/projects");

export const createProjectApi = (payload: CreateProjectPayload) =>
  api.post<ApiResponse<Project>>("/projects", payload);

export const getProjectApi = (id: string) =>
  api.get<ApiResponse<Project>>(`/projects/${id}`);

export const updateProjectApi = (
  id: string,
  payload: { title?: string; description?: string; status?: Project["status"] }
) => api.put<ApiResponse<Project>>(`/projects/${id}`, payload);

export const deleteProjectApi = (id: string) =>
  api.delete(`/projects/${id}`);

export const getStatisticsApi = (id: string) =>
  api.get<ApiResponse<import("@/types").ProjectStatistics>>(`/projects/${id}/statistics`);

export const getActivitiesApi = (id: string, limit = 50) =>
  api.get<ApiResponse<import("@/types").Activity[]>>(`/projects/${id}/activities?limit=${limit}`);

export const getMembersApi = (id: string) =>
  api.get<ApiResponse<import("@/types").Member[]>>(`/projects/${id}/members`);

export const addMemberApi = (
  id: string,
  payload: { user_id: string; role: "owner" | "contributor" | "viewer" }
) => api.post<ApiResponse<import("@/types").Member>>(`/projects/${id}/members`, payload);

export const removeMemberApi = (projectId: string, userId: string) =>
  api.delete(`/projects/${projectId}/members/${userId}`);