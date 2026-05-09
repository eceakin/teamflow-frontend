import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLabelsApi } from "@/lib/api/labels";
import { useAddLabelToTask, useRemoveLabelFromTask } from "@/hooks/useTasks";
import type { TaskLabel } from "@/types/task";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";

interface LabelSectionProps {
  taskId: string;
  projectId: string;
  labels: TaskLabel[];
  canEdit?: boolean;
}

export default function LabelSection({
  taskId,
  projectId,
  labels,
  canEdit = false,
}: LabelSectionProps) {
  const [adding, setAdding] = useState(false);
  const [selectedLabelId, setSelectedLabelId] = useState("");

  const { data: allLabels = [] } = useQuery({
    queryKey: ["labels", projectId],
    queryFn: () => getLabelsApi(projectId).then((r) => r.data.data),
    enabled: canEdit && adding,
  });

  const { mutate: addLabel, isPending: isAdding } = useAddLabelToTask(
    taskId,
    projectId,
  );
  const { mutate: removeLabel } = useRemoveLabelFromTask(taskId, projectId);

  // Zaten eklenmiş etiketleri dropdown'dan çıkar
  const attachedIds = new Set(labels.map((l) => l.id));
  const availableLabels = allLabels.filter((l) => !attachedIds.has(l.id));

  const handleAdd = () => {
    if (!selectedLabelId) return;
    addLabel(selectedLabelId, {
      onSuccess: () => {
        setSelectedLabelId("");
        setAdding(false);
      },
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Etiketler
      </p>

      {/* Mevcut etiketler */}
      <div className="flex flex-wrap gap-1.5">
        {labels.length === 0 && (
          <p className="text-sm text-muted-foreground">Etiket yok</p>
        )}
        {labels.map((label) => (
          <span
            key={label.id}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: label.color + "22",
              color: label.color,
              border: `1px solid ${label.color}55`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: label.color }}
            />
            {label.name}
            {canEdit && (
              <button
                onClick={() => removeLabel(label.id)}
                className="ml-0.5 hover:opacity-70 transition-opacity"
                aria-label={`${label.name} etiketini kaldır`}
              >
                <X className="size-2.5" />
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Ekleme satırı */}
      {canEdit && (
        <>
          {adding ? (
            <div className="flex items-center gap-2">
              <Select
                value={selectedLabelId}
                onValueChange={setSelectedLabelId}
              >
                <SelectTrigger className="h-7 flex-1 text-xs">
                  <SelectValue placeholder="Etiket seç..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLabels.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-2 py-1.5">
                      Eklenecek etiket yok
                    </p>
                  ) : (
                    availableLabels.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: l.color }}
                          />
                          {l.name}
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!selectedLabelId || isAdding}
                className="h-7 px-2 text-xs"
              >
                Ekle
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setSelectedLabelId("");
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
              Etiket ekle
            </Button>
          )}
        </>
      )}
    </div>
  );
}
