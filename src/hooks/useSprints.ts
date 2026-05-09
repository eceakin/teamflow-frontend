import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSprintsApi,
  createSprintApi,
  updateSprintApi,
  startSprintApi,
  endSprintApi,
  addTaskToSprintApi,
  removeTaskFromSprintApi,
  type Sprint,
} from "@/lib/api/sprints";

export type { Sprint };

export function useSprints(projectId: string) {
  return useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => getSprintsApi(projectId).then((r) => r.data.data),
    enabled: !!projectId,
  });
}

export function useCreateSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createSprintApi>[1]) =>
      createSprintApi(projectId, payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints", projectId] });
    },
  });
}

export function useUpdateSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sprintId,
      payload,
    }: {
      sprintId: string;
      payload: Parameters<typeof updateSprintApi>[1];
    }) => updateSprintApi(sprintId, payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints", projectId] });
    },
  });
}

export function useStartSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sprintId: string) =>
      startSprintApi(sprintId).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints", projectId] });
    },
  });
}

export function useEndSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sprintId: string) =>
      endSprintApi(sprintId).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints", projectId] });
      // Sprint bitince görevler backlog'a döner, task listesini de yenile
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

export function useAddTaskToSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sprintId, taskId }: { sprintId: string; taskId: string }) =>
      addTaskToSprintApi(sprintId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints", projectId] });
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

export function useRemoveTaskFromSprint(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sprintId, taskId }: { sprintId: string; taskId: string }) =>
      removeTaskFromSprintApi(sprintId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sprints", projectId] });
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}
