import { useQuery } from "@tanstack/react-query";
import { getMembersApi } from "@/lib/api/projects";
import { useAuthStore } from "@/store/authStore";

type Role = "owner" | "contributor" | "viewer" | null;

export function usePermission(projectId: string) {
  const user = useAuthStore((s) => s.user);

  const { data: members, isLoading } = useQuery({
    queryKey: ["members", projectId],
    queryFn: () => getMembersApi(projectId).then((r) => r.data.data),
    enabled: !!projectId,
  });

  const role: Role = members?.find((m) => m.id === user?.id)?.role ?? null;

  return {
    role,
    isLoading,
    canEdit: () => role === "owner" || role === "contributor",
    canDelete: () => role === "owner",
    canManageMembers: () => role === "owner",
  };
}