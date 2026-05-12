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
import { X, Tag } from "lucide-react";

interface LabelSectionProps {
  taskId: string;
  projectId: string;
  labels: TaskLabel[];
  /** false ise düzenleme kontrolleri gizlenir (viewer rolü) */
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
    <div className="space-y-3">
      {/* Jira Stili Küçük Başlık */}
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">
        Etiketler
      </p>

      {/* Mevcut etiketler */}
      <div className="flex flex-wrap gap-1.5">
        {labels.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground italic px-0.5">
            Etiket yok
          </p>
        )}

        {labels.map((label) => (
          <span
            key={label.id}
            className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-sm font-bold tracking-tight border shadow-sm transition-all"
            style={{
              backgroundColor: label.color + "15", // %15 şeffaflık
              color: label.color,
              borderColor: label.color + "30",
            }}
          >
            {/* Renkli Nokta */}
            <span
              className="size-1.5 rounded-full shrink-0"
              style={{ backgroundColor: label.color }}
            />
            {label.name.toUpperCase()}

            {canEdit && (
              <button
                onClick={() => removeLabel(label.id)}
                className="ml-0.5 hover:opacity-60 transition-opacity"
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
        <div className="pt-1">
          {adding ? (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedLabelId}
                  onValueChange={setSelectedLabelId}
                >
                  <SelectTrigger className="h-8 flex-1 text-xs bg-white border-blue-200 focus:ring-blue-500/20">
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
                            <span className="text-xs">{l.name}</span>
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={!selectedLabelId || isAdding}
                  className="h-7 px-3 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 uppercase tracking-tight"
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
                  className="h-7 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-tight"
                >
                  İptal
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdding(true)}
              className="h-8 px-2 text-[11px] font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-700 gap-1.5 -ml-2 transition-all uppercase tracking-tight"
            >
              <Tag className="size-3.5" />
              Etiket ekle
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
