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
import { X, UserPlus } from "lucide-react";

interface AssigneeSectionProps {
  taskId: string;
  projectId: string;
  assignees: TaskAssignee[];
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
    <div className="space-y-3">
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">
        Atananlar
      </p>

      <div className="flex flex-col gap-2">
        {assignees.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between group bg-transparent hover:bg-gray-100/50 p-1 -m-1 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Avatar className="size-6 border border-white shadow-sm">
                <AvatarImage src={a.avatar_url ?? undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-[10px] font-bold">
                  {(a.full_name || a.username)[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {a.full_name || a.username}
              </span>
            </div>
            {canEdit && (
              <button
                onClick={() => removeAssignee(a.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-600"
                aria-label="Kaldır"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}

        {assignees.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground italic px-0.5">
            Atanmamış
          </p>
        )}
      </div>

      {canEdit && (
        <div className="pt-1">
          {adding ? (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="h-8 text-xs bg-white border-blue-200 focus:ring-blue-500/20">
                  <SelectValue placeholder="Üye seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2 text-center">
                      Uygun üye bulunamadı
                    </p>
                  ) : (
                    availableMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="text-xs">
                        {m.full_name || m.username}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={!selectedUserId || isAdding}
                  className="h-7 px-3 text-[11px] font-bold bg-blue-600 hover:bg-blue-700"
                >
                  EKLE
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAdding(false);
                    setSelectedUserId("");
                  }}
                  className="h-7 px-3 text-[11px] font-bold text-gray-500"
                >
                  İPTAL
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdding(true)}
              className="h-8 px-2 text-[11px] font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-700 gap-1.5 -ml-2"
            >
              <UserPlus className="size-3.5" />
              KİŞİ EKLE
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
