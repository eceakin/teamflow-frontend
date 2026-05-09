import api from "@/lib/axios";
import type { ApiResponse, Label } from "@/types";

export const getLabelsApi = (projectId: string) =>
  api.get<ApiResponse<Label[]>>(`/projects/${projectId}/labels`);

export const createLabelApi = (projectId: string, payload: { name: string; color: string }) =>
  api.post<ApiResponse<Label>>(`/projects/${projectId}/labels`, payload);

export const deleteLabelApi = (labelId: string) =>
  api.delete(`/labels/${labelId}`);