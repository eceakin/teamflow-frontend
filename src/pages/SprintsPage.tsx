import { useParams } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner, EmptyState } from "@/components/shared/feedback";
import { Plus, Pencil, X, ChevronDown, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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

// ─── Yardımcılar ────────────────────────

const statusConfig: Record<
  Sprint["status"],
  { label: string; className: string }
> = {
  planning: {
    label: "Planlama",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  active: {
    label: "Aktif",
    className: "bg-blue-600 text-white border-transparent",
  },
  completed: {
    label: "Tamamlandı",
    className: "bg-green-100 text-green-700 border-green-200",
  },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

// ─── Sprint Formu ────────────────────────

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
      <div className="space-y-1.5">
        <Label
          htmlFor="sf-name"
          className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          Sprint Adı *
        </Label>
        <Input
          id="sf-name"
          {...register("name")}
          placeholder="örn: Sprint 1"
          autoFocus
          className="bg-gray-50 focus:bg-white"
        />
        {errors.name && (
          <p className="text-xs font-medium text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="sf-goal"
          className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          Hedef
        </Label>
        <Input
          id="sf-goal"
          {...register("goal")}
          placeholder="Neyi hedefliyorsunuz?"
          className="bg-gray-50 focus:bg-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="sf-start"
            className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            Başlangıç
          </Label>
          <Input
            id="sf-start"
            type="date"
            {...register("start_date")}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="sf-end"
            className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            Bitiş
          </Label>
          <Input
            id="sf-end"
            type="date"
            {...register("end_date")}
            className="bg-gray-50"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isPending}
          className="font-semibold"
        >
          İptal
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          {isPending ? "Kaydediliyor..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

// ─── Sprint Görev Satırı ────────────────────────

const taskStatusClass: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-50 text-blue-700",
  done: "bg-green-50 text-green-700",
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
    <div className="flex items-center justify-between py-1.5 px-3 bg-white border border-gray-100 mb-0.5 hover:border-blue-300 transition-all group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-4 bg-blue-500 rounded-sm flex items-center justify-center text-[8px] text-white font-bold shrink-0">
          S
        </div>
        <span className="text-sm text-gray-700 truncate font-medium">
          {title}
        </span>
        <span className="text-[9px] text-gray-400 font-bold uppercase shrink-0">
          TF-{taskId.slice(0, 4)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          className={cn(
            "text-[9px] font-bold px-1.5 py-0 shadow-none border-none",
            taskStatusClass[status],
          )}
        >
          {status.toUpperCase().replace("_", " ")}
        </Badge>
        {canEdit && (
          <button
            onClick={() => removeTask({ sprintId, taskId })}
            disabled={isPending}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Backlog Görev Seçici ────────────────────────

function BacklogPicker({
  sprintId,
  projectId,
  currentSprintTaskIds,
  onClose,
}: BacklogPickerProps) {
  const { data: allTasks = [] } = useTasks(projectId);
  const { mutate: addTask, isPending } = useAddTaskToSprint(projectId);

  const backlogTasks = allTasks.filter(
    (t) => !t.sprint_id && !currentSprintTaskIds.has(t.id),
  );

  return (
    <div className="space-y-1 mt-2">
      {backlogTasks.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4 bg-gray-50 rounded italic">
          Backlog'da atanabilir görev kalmadı.
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-1 p-1 bg-gray-50 rounded-md">
          {backlogTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between py-2 px-3 bg-white border rounded shadow-sm"
            >
              <span className="text-xs font-medium truncate flex-1">
                {task.title}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50"
                disabled={isPending}
                onClick={() =>
                  addTask({ sprintId, taskId: task.id }, { onSuccess: onClose })
                }
              >
                EKLE
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sprint Kartı ────────────────────────

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

  return (
    <Card
      className={cn(
        "border-kanban-border shadow-jira-card transition-all overflow-hidden",
        sprint.status === "active"
          ? "ring-1 ring-blue-500/30 border-blue-200"
          : "bg-gray-50/50",
      )}
    >
      <CardHeader className="p-4 bg-white/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-blue-600"
            >
              {expanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
            <div className="flex items-center gap-2 truncate">
              <CardTitle className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                {sprint.name}
              </CardTitle>
              <Badge
                className={cn(
                  "text-[9px] font-black px-1.5 py-0 shadow-none border",
                  cfg.className,
                )}
              >
                {cfg.label.toUpperCase()}
              </Badge>
              <span className="text-[10px] text-gray-400 font-bold ml-1 shrink-0">
                {allTasks.length} GÖREV •{" "}
                {formatDate(sprint.start_date) || "..."} -{" "}
                {formatDate(sprint.end_date) || "..."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && !editing && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditing(true)}
                  className="h-7 w-7 text-gray-400"
                >
                  <Pencil className="size-3.5" />
                </Button>
                {sprint.status === "planning" && (
                  <Button
                    size="sm"
                    onClick={() => startSprint(sprint.id)}
                    disabled={isStarting}
                    className="h-7 bg-blue-600 hover:bg-blue-700 text-xs font-bold"
                  >
                    SPRİNTİ BAŞLAT
                  </Button>
                )}
                {sprint.status === "active" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        disabled={isEnding}
                        className="h-7 bg-gray-800 hover:bg-gray-900 text-xs font-bold"
                      >
                        BITIR
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Sprint bitirilsin mi?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => endSprint(sprint.id)}
                          className="bg-blue-600"
                        >
                          Evet, Bitir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}
          </div>
        </div>
        {sprint.goal && !editing && (
          <p className="text-xs text-gray-500 mt-2 px-7 italic">
            "{sprint.goal}"
          </p>
        )}
      </CardHeader>

      <CardContent className="px-4 pb-4">
        {editing && (
          <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm mt-2">
            <SprintForm
              defaultValues={{
                name: sprint.name,
                goal: sprint.goal ?? "",
                start_date: sprint.start_date ?? "",
                end_date: sprint.end_date ?? "",
              }}
              onSubmit={(data) =>
                updateSprint(
                  { sprintId: sprint.id, payload: data },
                  { onSuccess: () => setEditing(false) },
                )
              }
              onCancel={() => setEditing(false)}
              isPending={isUpdating}
              submitLabel="Kaydet"
            />
          </div>
        )}

        {expanded && !editing && (
          <div className="mt-2 space-y-1">
            <div className="min-h-[20px]">
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
              {allTasks.length === 0 && (
                <p className="text-[11px] text-gray-400 py-3 text-center border border-dashed rounded-md">
                  Bu sprint henüz boş.
                </p>
              )}
            </div>

            {canEdit && sprint.status !== "completed" && (
              <div className="pt-2">
                {addingTask ? (
                  <div className="bg-white border rounded-lg p-3 shadow-md border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">
                        Backlog'dan Seç
                      </p>
                      <button onClick={() => setAddingTask(false)}>
                        <X className="size-3.5 text-gray-400" />
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
                    onClick={() => setAddingTask(true)}
                    className="h-7 text-[11px] font-bold text-blue-600 hover:bg-blue-50 gap-1"
                  >
                    <Plus className="size-3" /> GÖREV EKLE
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Ana Sayfa ────────────────────────

export default function SprintsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [createOpen, setCreateOpen] = useState(false);
  const { canEdit } = usePermission(projectId!);
  const { data: sprints = [], isLoading } = useSprints(projectId!);
  const { mutate: createSprint, isPending: isCreating } = useCreateSprint(
    projectId!,
  );

  const sorted = [...sprints].sort((a, b) => {
    const order = { active: 0, planning: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-1">
        <div>
          <nav className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Planlama / Çevik
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Zap className="size-6 text-blue-600" /> Sprintler
          </h1>
        </div>

        {canEdit() && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 font-bold px-4 shadow-sm"
              >
                <Plus className="size-4 mr-1.5" /> SPRİNT OLUŞTUR
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Yeni Sprint
                </DialogTitle>
              </DialogHeader>
              <SprintForm
                onSubmit={(data) =>
                  createSprint(data, { onSuccess: () => setCreateOpen(false) })
                }
                onCancel={() => setCreateOpen(false)}
                isPending={isCreating}
                submitLabel="Oluştur"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {sorted.length === 0 ? (
          <EmptyState
            title="Sprint Planlanmadı"
            description="Projeyi başlatmak için bir sprint oluşturun ve görevleri buraya taşıyın."
            icon={<Zap className="size-12" />}
          />
        ) : (
          sorted.map((s) => (
            <SprintCard
              key={s.id}
              sprint={s}
              projectId={projectId!}
              canEdit={canEdit()}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Gerekli Interface Tanımları
interface TaskRowProps {
  taskId: string;
  title: string;
  status: string;
  sprintId: string;
  projectId: string;
  canEdit: boolean;
}
interface BacklogPickerProps {
  sprintId: string;
  projectId: string;
  currentSprintTaskIds: Set<string>;
  onClose: () => void;
}
interface SprintCardProps {
  sprint: Sprint;
  projectId: string;
  canEdit: boolean;
}
