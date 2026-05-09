import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMembersApi } from "@/lib/api/projects";
import { useAddAssignee, useRemoveAssignee } from "@/hooks/useTasks";
import type { TaskAssignee } from "@/types/task";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Plus } from "lucide-react";

interface AssigneeSectionProps {
  taskId: string;
  projectId: string;
  assignees: TaskAssignee[];
  /** false ise düzenleme kontrolleri gizlenir (viewer rolü) */
  canEdit?: boolean;
}

export default function AssigneeSection({
  taskId,
  projectId,
  assignees,
  canEdit = false,
}: AssigneeSectionProps) {
  const [adding, setAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  // Projedeki tüm üyeler — ekleme dropdown'u için
  const { data: members = [] } = useQuery({
    queryKey: ["members", projectId],
    queryFn: () => getMembersApi(projectId).then((r) => r.data.data),
    enabled: canEdit && adding,
  });

  const { mutate: addAssignee, isPending: isAdding } = useAddAssignee(
    taskId,
    projectId,
  );
  const { mutate: removeAssignee } = useRemoveAssignee(taskId, projectId);

  // Zaten atanmış kullanıcıları dropdown'dan çıkar
  const assignedIds = new Set(assignees.map((a) => a.id));
  const availableMembers = members.filter((m) => !assignedIds.has(m.id));

  const handleAdd = () => {
    if (!selectedUserId) return;
    addAssignee(selectedUserId, {
      onSuccess: () => {
        setSelectedUserId("");
        setAdding(false);
      },
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Atananlar
      </p>

      {/* Mevcut atananlar */}
      <div className="flex flex-col gap-1.5">
        {assignees.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz kimse atanmamış</p>
        )}
        {assignees.map((a) => (
          <div key={a.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarImage src={a.avatar_url ?? undefined} />
                <AvatarFallback>
                  {(a.full_name || a.username)[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{a.full_name || a.username}</span>
            </div>
            {canEdit && (
              <button
                onClick={() => removeAssignee(a.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                aria-label={`${a.username} atamasını kaldır`}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Ekleme satırı */}
      {canEdit && (
        <>
          {adding ? (
            <div className="flex items-center gap-2">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="h-7 flex-1 text-xs">
                  <SelectValue placeholder="Üye seç..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-2 py-1.5">
                      Eklenecek üye yok
                    </p>
                  ) : (
                    availableMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.full_name || m.username}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!selectedUserId || isAdding}
                className="h-7 px-2 text-xs"
              >
                Ekle
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setSelectedUserId("");
                }}
                className="h-7 px-2 text-xs"
              >
                İptal
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdding(true)}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <Plus className="size-3" />
              Kişi ekle
            </Button>
          )}
        </>
      )}
    </div>
  );
}
