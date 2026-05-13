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
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Tamamlandı",
    className: "bg-green-50 text-green-700 border-green-200",
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white">
      <div className="space-y-2">
        <Label
          htmlFor="sf-name"
          className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          Sprint Adı *
        </Label>
        <Input
          id="sf-name"
          {...register("name")}
          placeholder="örn: Sprint 1"
          autoFocus
          className="h-10 border-gray-200 bg-gray-50/30 focus:bg-white transition-all font-medium text-gray-900 shadow-sm"
        />
        {errors.name && (
          <p className="text-[10px] font-bold text-red-500 uppercase mt-1">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="sf-goal"
          className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          Hedef
        </Label>
        <Input
          id="sf-goal"
          {...register("goal")}
          placeholder="Bu sprintin temel amacı nedir?"
          className="h-10 border-gray-200 bg-gray-50/30 focus:bg-white transition-all font-medium text-gray-900 shadow-sm"
        />
        {errors.goal && (
          <p className="text-[10px] font-bold text-red-500 uppercase mt-1">
            {errors.goal.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="sf-start"
            className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Başlangıç
          </Label>
          <Input
            id="sf-start"
            type="date"
            {...register("start_date")}
            className="h-10 border-gray-200 bg-gray-50/30 focus:bg-white transition-all font-medium text-gray-900 shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="sf-end"
            className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Bitiş
          </Label>
          <Input
            id="sf-end"
            type="date"
            {...register("end_date")}
            className="h-10 border-gray-200 bg-gray-50/30 focus:bg-white transition-all font-medium text-gray-900 shadow-sm"
          />
          {errors.end_date && (
            <p className="text-[10px] font-bold text-red-500 uppercase mt-1">
              {errors.end_date.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isPending}
          className="text-xs font-bold tracking-widest uppercase text-gray-600 hover:bg-gray-100 transition-colors"
        >
          İptal
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shadow-sm uppercase text-xs tracking-widest transition-all h-10"
        >
          {isPending ? "KAYDEDİLİYOR..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

// ─── Sprint Görev Satırı ────────────────────────

const taskStatusClass: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600 border-gray-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  done: "bg-green-50 text-green-700 border-green-200",
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
    <div className="flex items-center justify-between py-2 px-4 bg-white border border-gray-200 rounded-md mb-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-blue-300 hover:shadow-md transition-all group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-5 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white font-black shrink-0 shadow-sm">
          S
        </div>
        <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded border border-gray-200 uppercase shrink-0">
          TF-{taskId.slice(0, 4)}
        </span>
        <span className="text-sm text-gray-800 truncate font-semibold">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Badge
          className={cn(
            "text-[9px] font-black px-2 py-0.5 shadow-none border uppercase tracking-widest",
            taskStatusClass[status],
          )}
        >
          {status.replace("_", " ")}
        </Badge>
        {canEdit && (
          <button
            onClick={() => removeTask({ sprintId, taskId })}
            disabled={isPending}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-1.5 rounded-md border border-transparent hover:border-red-200"
            title="Görevi Sprint'ten Çıkar"
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
    <div className="space-y-1 mt-3">
      {backlogTasks.length === 0 ? (
        <p className="text-[11px] font-medium text-gray-500 text-center py-6 bg-gray-50 rounded-md border border-dashed border-gray-200">
          Backlog'da atanabilir görev bulunmuyor.
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-1.5 p-1 custom-scrollbar">
          {backlogTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between py-2.5 px-3 bg-white border border-gray-200 rounded-md shadow-sm hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider shrink-0 bg-gray-100 px-1.5 py-0.5 rounded">
                  TF-{task.id.slice(0, 4)}
                </span>
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {task.title}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-3 text-[10px] font-black tracking-widest text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all shrink-0 ml-2"
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
        "border-kanban-border shadow-jira-card transition-all overflow-hidden mb-6",
        sprint.status === "active"
          ? "ring-2 ring-blue-500/20 border-blue-300"
          : "bg-white",
      )}
    >
      <CardHeader className="p-4 bg-gray-50/50 border-b border-gray-100 transition-colors hover:bg-gray-50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
            >
              {expanded ? (
                <ChevronDown className="size-5" />
              ) : (
                <ChevronRight className="size-5" />
              )}
            </button>
            <div className="flex items-center gap-3 truncate">
              <CardTitle className="text-base font-bold text-gray-900 tracking-tight">
                {sprint.name}
              </CardTitle>
              <Badge
                className={cn(
                  "text-[10px] font-black px-2 py-0.5 shadow-none border uppercase tracking-widest",
                  cfg.className,
                )}
              >
                {cfg.label}
              </Badge>
              <span className="text-[11px] text-gray-500 font-bold ml-1 shrink-0 bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
                {allTasks.length} GÖREV
              </span>
              <span className="text-[11px] text-gray-400 font-semibold ml-2 shrink-0">
                {formatDate(sprint.start_date) || "Belirtilmedi"} -{" "}
                {formatDate(sprint.end_date) || "Belirtilmedi"}
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
                  className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Pencil className="size-4" />
                </Button>
                {sprint.status === "planning" && (
                  <Button
                    size="sm"
                    onClick={() => startSprint(sprint.id)}
                    disabled={isStarting}
                    className="h-8 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-black tracking-widest uppercase border border-gray-300 shadow-sm transition-colors"
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
                        className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black tracking-widest uppercase shadow-sm transition-colors"
                      >
                        SPRİNTİ BİTİR
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-kanban-border shadow-2xl sm:max-w-md bg-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-bold text-gray-900 text-lg">
                          Sprint bitirilsin mi?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <p className="text-sm text-gray-600 font-medium">
                        Bu işlemi onaylarsanız sprint tamamlandı olarak
                        işaretlenecek ve içerisindeki görevlerin durumları
                        korunacaktır.
                      </p>
                      <AlertDialogFooter className="mt-6 border-t border-gray-100 pt-4">
                        <AlertDialogCancel className="font-bold text-xs uppercase tracking-widest hover:bg-gray-100">
                          İptal
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => endSprint(sprint.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-sm"
                        >
                          EVET, BİTİR
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
          <div className="mt-3 ml-11 bg-blue-50/50 border border-blue-100 p-2.5 rounded-md inline-block">
            <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
              <strong className="font-bold mr-1 uppercase tracking-wider">
                Sprint Hedefi:
              </strong>
              {sprint.goal}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {editing && (
          <div className="bg-gray-50/50 p-6 border-b border-gray-200">
            <div className="max-w-2xl bg-white p-6 rounded-lg border border-kanban-border shadow-sm mx-auto">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <Pencil className="size-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
                  Sprinti Düzenle
                </h3>
              </div>
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
                submitLabel="DEĞİŞİKLİKLERİ KAYDET"
              />
            </div>
          </div>
        )}

        {expanded && !editing && (
          <div className="p-4 bg-gray-50/30">
            <div className="min-h-[40px]">
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
                <div className="text-[12px] font-medium text-gray-500 py-8 text-center border-2 border-dashed border-gray-200 rounded-lg bg-white">
                  Bu sprint içerisine henüz bir görev eklenmemiş.
                </div>
              )}
            </div>

            {canEdit && sprint.status !== "completed" && (
              <div className="pt-4">
                {addingTask ? (
                  <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-lg max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                      <p className="text-[11px] font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                        <Plus className="size-4 text-blue-600" /> Backlog'dan
                        Görev Seç
                      </p>
                      <button
                        onClick={() => setAddingTask(false)}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <X className="size-4 text-gray-500 hover:text-red-600" />
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
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingTask(true)}
                    className="h-9 text-[11px] font-black tracking-widest uppercase text-gray-700 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 gap-2 border-dashed border-gray-300 transition-colors bg-white"
                  >
                    <Plus className="size-3.5" /> YENİ GÖREV EKLE
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Üst Başlık */}
      <div className="flex items-center justify-between px-1">
        <div>
          <nav className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Planlama / Çevik Yönetim
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 shadow-sm h-10 tracking-widest uppercase text-xs transition-all"
              >
                <Plus className="size-4 mr-1.5" /> YENİ SPRİNT OLUŞTUR
              </Button>
            </DialogTrigger>
            {/* BURAYA BEYAZ ARKA PLAN EKLENDİ (bg-white) */}
            <DialogContent className="sm:max-w-lg border-kanban-border shadow-2xl p-0 overflow-hidden bg-white">
              <DialogHeader className="bg-gray-50/50 border-b border-gray-100 p-6 pb-5">
                <DialogTitle className="text-sm font-bold uppercase tracking-widest text-gray-800 flex items-center gap-2">
                  <Zap className="size-4 text-blue-600" /> Sprint Planla
                </DialogTitle>
              </DialogHeader>
              <div className="p-6 bg-white">
                <SprintForm
                  onSubmit={(data) =>
                    createSprint(data, {
                      onSuccess: () => setCreateOpen(false),
                    })
                  }
                  onCancel={() => setCreateOpen(false)}
                  isPending={isCreating}
                  submitLabel="SPRİNT OLUŞTUR"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-6 pt-2">
        {sorted.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="Sprint Planlanmadı"
              description="Projeyi çevik bir şekilde yönetmek için ilk sprintinizi oluşturun ve backlog'dan görevler eklemeye başlayın."
              action={
                <Button
                  onClick={() => setCreateOpen(true)}
                  size="sm"
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-widest uppercase text-xs"
                >
                  <Plus className="size-4 mr-1.5" /> İLK SPRİNTİ OLUŞTUR
                </Button>
              }
            />
          </div>
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
