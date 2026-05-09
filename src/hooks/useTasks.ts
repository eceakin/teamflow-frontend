import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type { Task, TaskStatus } from "@/types/task";

// ─── API fonksiyonları ────────────────────────────────────────

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
    status?: TaskStatus;
    priority?: Task["priority"];
    due_date?: string;
    sprint_id?: string;
  },
) => api.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, payload);

export const updateTaskApi = (taskId: string, payload: Partial<Task>) =>
  api.put<ApiResponse<Task>>(`/tasks/${taskId}`, payload);

export const updateTaskStatusApi = (taskId: string, status: TaskStatus) =>
  api.patch<ApiResponse<Task>>(`/tasks/${taskId}/status`, { status });

export const deleteTaskApi = (taskId: string) => api.delete(`/tasks/${taskId}`);

// ─── Hooks ───────────────────────────────────────────────────

/** Proje görevlerini getirir. filters opsiyonel. */
export function useTasks(
  projectId: string,
  filters?: { status?: TaskStatus; sprint_id?: string; assignee_id?: string },
) {
  const params: Record<string, string> = {};
  if (filters?.status) params.status = filters.status;
  if (filters?.sprint_id) params.sprint_id = filters.sprint_id;
  if (filters?.assignee_id) params.assignee_id = filters.assignee_id;

  return useQuery({
    queryKey: ["tasks", projectId, filters],
    queryFn: () => getTasksApi(projectId, params).then((r) => r.data.data),
    enabled: !!projectId,
  });
}

/** Tek görev detayı */
export function useTask(taskId: string) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskApi(taskId).then((r) => r.data.data),
    enabled: !!taskId,
  });
}

/** Status güncelleme mutation — Kanban sürükle-bırak için */
export function useUpdateTaskStatus(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTaskStatusApi(taskId, status),

    // Optimistic update
    onMutate: async ({ taskId, status }) => {
      await qc.cancelQueries({ queryKey: ["tasks", projectId] });
      const previous = qc.getQueryData<Task[]>(["tasks", projectId]);

      qc.setQueryData<Task[]>(
        ["tasks", projectId],
        (old) =>
          old?.map((t) => (t.id === taskId ? { ...t, status } : t)) ?? [],
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["tasks", projectId], context.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

/** Görev oluşturma */
export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createTaskApi>[1]) =>
      createTaskApi(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

/** Görev silme */
export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTaskApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}
