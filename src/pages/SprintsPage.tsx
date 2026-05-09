import { useParams } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  useSprints,
  useCreateSprint,
  useUpdateSprint,
  useStartSprint,
  useEndSprint,
  type Sprint,
} from "@/hooks/useSprints";
import { useTasks } from "@/hooks/useTasks";
import {
  useAddTaskToSprint,
  useRemoveTaskFromSprint,
} from "@/hooks/useSprints";
import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner, EmptyState } from "@/components/shared/feedback";
import {
  Plus,
  Play,
  Square,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Zap,
} from "lucide-react";

// ─── Şemalar ─────────────────────────────────────────────────

const sprintSchema = z
  .object({
    name: z
      .string()
      .min(1, "Sprint adı zorunludur")
      .max(100, "En fazla 100 karakter"),
    goal: z
      .string()
      .max(500, "En fazla 500 karakter")
      .optional()
      .or(z.literal("")),
    start_date: z.string().optional().or(z.literal("")),
    end_date: z.string().optional().or(z.literal("")),
  })
  .refine(
    (d) => {
      if (d.start_date && d.end_date) return d.end_date > d.start_date;
      return true;
    },
    {
      message: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır",
      path: ["end_date"],
    },
  );

type SprintFormData = z.infer<typeof sprintSchema>;

// ─── Yardımcı: durum etiketi ve rengi ────────────────────────

const statusConfig: Record<
  Sprint["status"],
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  planning: { label: "Planlama", variant: "outline" },
  active: { label: "Aktif", variant: "default" },
  completed: { label: "Tamamlandı", variant: "secondary" },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Sprint formu (oluştur / düzenle) ────────────────────────

interface SprintFormProps {
  defaultValues?: SprintFormData;
  onSubmit: (data: SprintFormData) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

function SprintForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: SprintFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SprintFormData>({
    resolver: zodResolver(sprintSchema),
    defaultValues: defaultValues ?? {
      name: "",
      goal: "",
      start_date: "",
      end_date: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="sf-name">Sprint Adı *</Label>
        <Input
          id="sf-name"
          {...register("name")}
          placeholder="örn: Sprint 1"
          autoFocus
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="sf-goal">Hedef</Label>
        <Input
          id="sf-goal"
          {...register("goal")}
          placeholder="Bu sprint'te ne başarmak istiyorsunuz?"
        />
        {errors.goal && (
          <p className="text-sm text-destructive">{errors.goal.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="sf-start">Başlangıç</Label>
          <Input id="sf-start" type="date" {...register("start_date")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sf-end">Bitiş</Label>
          <Input id="sf-end" type="date" {...register("end_date")} />
          {errors.end_date && (
            <p className="text-sm text-destructive">
              {errors.end_date.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          İptal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Kaydediliyor..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

// ─── Görev atama satırı ───────────────────────────────────────

interface TaskRowProps {
  taskId: string;
  title: string;
  status: string;
  sprintId: string;
  projectId: string;
  canEdit: boolean;
}

const statusLabel: Record<string, string> = {
  todo: "Yapılacak",
  in_progress: "Devam Ediyor",
  done: "Tamamlandı",
};

const statusClass: Record<string, string> = {
  todo: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

function SprintTaskRow({
  taskId,
  title,
  status,
  sprintId,
  projectId,
  canEdit,
}: TaskRowProps) {
  const { mutate: removeTask, isPending } = useRemoveTaskFromSprint(projectId);

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/40 group transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ${statusClass[status] ?? "bg-muted text-muted-foreground"}`}
        >
          {statusLabel[status] ?? status}
        </span>
        <span className="text-sm truncate">{title}</span>
      </div>
      {canEdit && (
        <button
          onClick={() => removeTask({ sprintId, taskId })}
          disabled={isPending}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 ml-2"
          aria-label="Sprint'ten çıkar"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Backlog görev seçici ──────────────────────────────────────

interface BacklogPickerProps {
  sprintId: string;
  projectId: string;
  currentSprintTaskIds: Set<string>;
  onClose: () => void;
}

function BacklogPicker({
  sprintId,
  projectId,
  currentSprintTaskIds,
  onClose,
}: BacklogPickerProps) {
  const { data: allTasks = [] } = useTasks(projectId);
  const { mutate: addTask, isPending } = useAddTaskToSprint(projectId);

  // Backlog = sprint_id yok veya farklı bir sprint'te olan görevler
  const backlogTasks = allTasks.filter(
    (t) => !t.sprint_id && !currentSprintTaskIds.has(t.id),
  );

  return (
    <div className="space-y-3">
      {backlogTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Backlog'da görev yok
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-1">
          {backlogTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/40 transition-colors"
            >
              <span className="text-sm truncate flex-1">{task.title}</span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs shrink-0 ml-2"
                disabled={isPending}
                onClick={() =>
                  addTask({ sprintId, taskId: task.id }, { onSuccess: onClose })
                }
              >
                Ekle
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tek sprint kartı ─────────────────────────────────────────

interface SprintCardProps {
  sprint: Sprint;
  projectId: string;
  canEdit: boolean;
}

function SprintCard({ sprint, projectId, canEdit }: SprintCardProps) {
  const [expanded, setExpanded] = useState(sprint.status === "active");
  const [editing, setEditing] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  const { mutate: updateSprint, isPending: isUpdating } =
    useUpdateSprint(projectId);
  const { mutate: startSprint, isPending: isStarting } =
    useStartSprint(projectId);
  const { mutate: endSprint, isPending: isEnding } = useEndSprint(projectId);

  const { data: allTasks = [] } = useTasks(projectId, { sprint_id: sprint.id });
  const sprintTaskIds = new Set(allTasks.map((t) => t.id));

  const cfg = statusConfig[sprint.status];

  const handleUpdate = (data: SprintFormData) => {
    updateSprint(
      {
        sprintId: sprint.id,
        payload: {
          name: data.name,
          goal: data.goal || undefined,
          start_date: data.start_date || undefined,
          end_date: data.end_date || undefined,
        },
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  return (
    <Card
      className={sprint.status === "active" ? "ring-2 ring-primary/40" : ""}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={expanded ? "Daralt" : "Genişlet"}
            >
              {expanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
            {editing ? (
              <span className="text-base font-semibold">{sprint.name}</span>
            ) : (
              <CardTitle className="text-base">{sprint.name}</CardTitle>
            )}
            <Badge variant={cfg.variant} className="shrink-0">
              {cfg.label}
            </Badge>
            <span className="text-xs text-muted-foreground shrink-0">
              {allTasks.length} görev
            </span>
          </div>

          {/* Eylem butonları */}
          {canEdit && !editing && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditing(true)}
                aria-label="Düzenle"
              >
                <Pencil className="size-3.5" />
              </Button>

              {sprint.status === "planning" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  disabled={isStarting}
                  onClick={() => startSprint(sprint.id)}
                >
                  <Play className="size-3" />
                  Başlat
                </Button>
              )}

              {sprint.status === "active" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-xs"
                      disabled={isEnding}
                    >
                      <Square className="size-3" />
                      Bitir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sprint bitirilsin mi?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tamamlanmamış görevler backlog'a taşınacak. Bu işlem
                        geri alınamaz.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => endSprint(sprint.id)}>
                        Evet, Bitir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>

        {/* Tarih ve hedef satırı */}
        {!editing && (
          <div className="pl-6 space-y-1">
            {(sprint.start_date || sprint.end_date) && (
              <p className="text-xs text-muted-foreground">
                {formatDate(sprint.start_date) ?? "—"} →{" "}
                {formatDate(sprint.end_date) ?? "—"}
              </p>
            )}
            {sprint.goal && (
              <p className="text-sm text-muted-foreground italic">
                "{sprint.goal}"
              </p>
            )}
          </div>
        )}
      </CardHeader>

      {/* Düzenleme formu */}
      {editing && (
        <CardContent className="pt-0 pb-4">
          <SprintForm
            defaultValues={{
              name: sprint.name,
              goal: sprint.goal ?? "",
              start_date: sprint.start_date ?? "",
              end_date: sprint.end_date ?? "",
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            isPending={isUpdating}
            submitLabel="Kaydet"
          />
        </CardContent>
      )}

      {/* Görev listesi */}
      {expanded && !editing && (
        <CardContent className="pt-0 pb-4 space-y-2">
          {allTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2 px-3">
              Bu sprint'te henüz görev yok.
            </p>
          ) : (
            <div className="space-y-0.5">
              {allTasks.map((task) => (
                <SprintTaskRow
                  key={task.id}
                  taskId={task.id}
                  title={task.title}
                  status={task.status}
                  sprintId={sprint.id}
                  projectId={projectId}
                  canEdit={canEdit && sprint.status !== "completed"}
                />
              ))}
            </div>
          )}

          {/* Görev ekle */}
          {canEdit && sprint.status !== "completed" && (
            <>
              {addingTask ? (
                <div className="border rounded-lg p-3 mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Backlog'dan Görev Ekle
                    </p>
                    <button
                      onClick={() => setAddingTask(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <BacklogPicker
                    sprintId={sprint.id}
                    projectId={projectId}
                    currentSprintTaskIds={sprintTaskIds}
                    onClose={() => setAddingTask(false)}
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 mt-1"
                  onClick={() => setAddingTask(true)}
                >
                  <Plus className="size-3" />
                  Görev ekle
                </Button>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── SprintsPage ──────────────────────────────────────────────

export default function SprintsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [createOpen, setCreateOpen] = useState(false);
  const { canEdit } = usePermission(projectId!);

  const { data: sprints = [], isLoading } = useSprints(projectId!);
  const { mutate: createSprint, isPending: isCreating } = useCreateSprint(
    projectId!,
  );

  const handleCreate = (data: SprintFormData) => {
    createSprint(
      {
        name: data.name,
        goal: data.goal || undefined,
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
      },
      { onSuccess: () => setCreateOpen(false) },
    );
  };

  // Sıralama: active → planning → completed
  const sorted = [...sprints].sort((a, b) => {
    const order = { active: 0, planning: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-4">
      {/* Üst bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="size-5" />
          Sprintler
        </h2>

        {canEdit() && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" />
                Sprint Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Sprint</DialogTitle>
              </DialogHeader>
              <SprintForm
                onSubmit={handleCreate}
                onCancel={() => setCreateOpen(false)}
                isPending={isCreating}
                submitLabel="Oluştur"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* İçerik */}
      {sorted.length === 0 ? (
        <EmptyState
          title="Henüz sprint yok"
          description="İlk sprinti oluşturmak için Sprint Oluştur butonuna tıkla."
          action={
            canEdit() ? (
              <Button onClick={() => setCreateOpen(true)} size="sm">
                <Plus className="size-4 mr-1.5" />
                Sprint Oluştur
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((sprint) => (
            <SprintCard
              key={sprint.id}
              sprint={sprint}
              projectId={projectId!}
              canEdit={canEdit()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
