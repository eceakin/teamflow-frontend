import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, TaskStatus, Comment } from "@/types/task";
import {
  getTasksApi,
  getTaskApi,
  createTaskApi,
  updateTaskApi,
  updateTaskStatusApi,
  deleteTaskApi,
  addAssigneeApi,
  removeAssigneeApi,
  addLabelToTaskApi,
  removeLabelFromTaskApi,
  getCommentsApi,
  createCommentApi,
  updateCommentApi,
  deleteCommentApi,
} from "@/lib/api/tasks";

// ─── Filtre tipi ──────────────────────────────────────────────

export interface TaskFilters {
  status?: TaskStatus;
  sprint_id?: string;
  assignee_id?: string;
}

// ─── useTasks ────────────────────────────────────────────────

export function useTasks(projectId: string, filters?: TaskFilters) {
  const params: Record<string, string> = {};
  if (filters?.status) params.status = filters.status;
  if (filters?.sprint_id) params.sprint_id = filters.sprint_id;
  if (filters?.assignee_id) params.assignee_id = filters.assignee_id;

  return useQuery({
    queryKey: ["tasks", projectId, filters ?? {}],
    queryFn: () => getTasksApi(projectId, params).then((r) => r.data.data),
    enabled: !!projectId,
  });
}

// ─── useTask ─────────────────────────────────────────────────

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskApi(taskId).then((r) => r.data.data),
    enabled: !!taskId,
  });
}

// ─── useUpdateTaskStatus (Kanban optimistic) ──────────────────

export function useUpdateTaskStatus(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTaskStatusApi(taskId, status),

    onMutate: async ({ taskId, status }) => {
      await qc.cancelQueries({ queryKey: ["tasks", projectId] });

      const previousEntries = qc.getQueriesData<Task[]>({
        queryKey: ["tasks", projectId],
      });

      qc.setQueriesData<Task[]>(
        { queryKey: ["tasks", projectId] },
        (old) =>
          old?.map((t) => (t.id === taskId ? { ...t, status } : t)) ?? [],
      );

      qc.setQueryData<Task>(["task", taskId], (old) =>
        old ? { ...old, status } : old,
      );

      return { previousEntries };
    },

    onError: (_err, _vars, context) => {
      context?.previousEntries.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

// ─── useCreateTask ────────────────────────────────────────────

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof createTaskApi>[1]) =>
      createTaskApi(projectId, payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

// ─── useUpdateTask ────────────────────────────────────────────

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: Parameters<typeof updateTaskApi>[1];
    }) => updateTaskApi(taskId, payload).then((r) => r.data.data),

    onSuccess: (updatedTask) => {
      qc.setQueryData(["task", updatedTask.id], updatedTask);
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

// ─── useDeleteTask ────────────────────────────────────────────

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTaskApi(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

// ─── useAddAssignee ───────────────────────────────────────────

export function useAddAssignee(taskId: string, projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => addAssigneeApi(taskId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

// ─── useRemoveAssignee ────────────────────────────────────────

export function useRemoveAssignee(taskId: string, projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeAssigneeApi(taskId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

// ─── useAddLabelToTask ────────────────────────────────────────

export function useAddLabelToTask(taskId: string, projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) => addLabelToTaskApi(taskId, labelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

// ─── useRemoveLabelFromTask ───────────────────────────────────

export function useRemoveLabelFromTask(taskId: string, projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) => removeLabelFromTaskApi(taskId, labelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", taskId] });
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

// ─── useComments ──────────────────────────────────────────────

export function useComments(taskId: string) {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => getCommentsApi(taskId).then((r) => r.data.data),
    enabled: !!taskId,
  });
}

// ─── useCreateComment ─────────────────────────────────────────

export function useCreateComment(taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: { content: string; parent_id?: string }) =>
      createCommentApi(taskId, payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", taskId] });
    },
  });
}

// ─── useUpdateComment ─────────────────────────────────────────

export function useUpdateComment(taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => updateCommentApi(commentId, content).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", taskId] });
    },
  });
}

// ─── useDeleteComment ─────────────────────────────────────────

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteCommentApi(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", taskId] });
    },
  });
}

// ─── Re-export type ───────────────────────────────────────────
// Dışarıdan import kolaylığı için
export type { Comment };
