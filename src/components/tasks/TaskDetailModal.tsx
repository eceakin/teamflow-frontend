import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { usePermission } from "@/hooks/usePermission";
import AssigneeSection from "@/components/tasks/AssigneeSection";
import LabelSection from "@/components/tasks/LabelSection";
import CommentSection from "@/components/tasks/CommentSection";
import AttachmentList from "@/components/tasks/AttachmentList";
import FileUpload from "@/components/tasks/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { LoadingSpinner } from "@/components/shared/feedback";
import {
  Pencil,
  Trash2,
  X,
  Check,
  Eye,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import type { Task } from "@/types/task";
import { cn } from "@/lib/utils";

// ─── Düzenleme formu şeması ───────────────────────────────────

const editSchema = z.object({
  title: z.string().min(1, "Başlık zorunludur").max(255),
  description: z.string().max(2000).optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["todo", "in_progress", "done"]),
  due_date: z.string().optional().or(z.literal("")),
});

type EditFormData = z.infer<typeof editSchema>;

// ─── Yardımcı etiket haritaları ──────────────────────────────

const statusLabel: Record<Task["status"], string> = {
  todo: "Yapılacak",
  in_progress: "Devam Ediyor",
  done: "Tamamlandı",
};

const priorityLabel: Record<Task["priority"], string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  critical: "Kritik",
};

const priorityColor: Record<Task["priority"], string> = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  critical: "text-red-600 font-semibold",
};

// ─── İçerik bileşeni (modal veya sayfa) ──────────────────────

function TaskDetailContent({
  task,
  projectId,
  onClose,
}: {
  task: Task;
  projectId: string;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const { canEdit, canDelete } = usePermission(projectId);

  const { mutate: updateTask, isPending: isUpdating } =
    useUpdateTask(projectId);
  const { mutate: deleteTask, isPending: isDeleting } =
    useDeleteTask(projectId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ?? "",
    },
  });

  useEffect(() => {
    reset({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ?? "",
    });
  }, [task, reset]);

  const startEdit = () => setEditing(true);
  const cancelEdit = () => {
    reset();
    setEditing(false);
  };

  const onSubmit = (data: EditFormData) => {
    updateTask(
      {
        taskId: task.id,
        payload: {
          title: data.title,
          description: data.description || undefined,
          priority: data.priority,
          status: data.status,
          due_date: data.due_date || null,
        },
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleDelete = () => {
    deleteTask(task.id, { onSuccess: () => onClose() });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-950">
      {/* ── Üst bar (Jira Stil Toolbar) ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">
          <Eye className="size-3.5" />
          <span>TEAMFLOW-{task.id.slice(0, 5)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm">
            <Share2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="size-4" />
          </Button>

          {canEdit() && (
            <div className="flex items-center gap-1 ml-2 border-l pl-2">
              {editing ? (
                <>
                  <Button
                    size="icon-sm"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="size-4 text-white" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={cancelEdit}>
                    <X className="size-4" />
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="icon-sm" onClick={startEdit}>
                  <Pencil className="size-4" />
                </Button>
              )}
            </div>
          )}

          {canDelete() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Görevi sil?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu işlem geri alınamaz.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Siliniyor..." : "Evet, Sil"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="ml-1"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── SOL KOLON: Ana Detaylar ── */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scrollbar-thin">
          {/* Başlık Bölümü */}
          <div className="space-y-1">
            {editing ? (
              <div className="space-y-2">
                <Input
                  {...register("title")}
                  className="text-2xl font-bold bg-transparent border-2 border-blue-500 focus-visible:ring-0 px-2 py-1 h-auto w-full"
                  autoFocus
                />
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>
            ) : (
              <h1
                onClick={() => canEdit() && startEdit()}
                className="text-2xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100/50 p-2 -ml-2 rounded transition-all leading-tight"
              >
                {task.title}
              </h1>
            )}
          </div>

          {/* Açıklama Bölümü */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
              Açıklama
            </Label>
            {editing ? (
              <div className="space-y-3">
                <Textarea
                  {...register("description")}
                  className="text-sm min-h-[180px] focus-visible:ring-2 focus-visible:ring-blue-500 leading-relaxed"
                  placeholder="Detaylı açıklama ekleyin..."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUpdating ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    İptal
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => canEdit() && startEdit()}
                className="text-sm text-gray-800 dark:text-gray-200 min-h-[60px] cursor-pointer hover:bg-gray-100/50 p-3 -ml-3 rounded transition-all whitespace-pre-wrap leading-relaxed"
              >
                {task.description || (
                  <span className="text-muted-foreground italic">
                    Açıklama eklemek için tıkla...
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Dosya Ekleri */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Ekler
            </h3>
            <AttachmentList taskId={task.id} canEdit={canEdit()} />
            {!editing && canEdit() && (
              <div className="pt-2">
                <FileUpload taskId={task.id} />
              </div>
            )}
          </div>

          {/* Yorumlar (Aktivite) */}
          <div className="border-t pt-8">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-6 uppercase tracking-wider">
              Aktivite
            </h3>
            <CommentSection taskId={task.id} />
          </div>
        </div>

        {/* SAĞ KOLON: Sidebar (Meta Veriler) */}
        <div className="w-[300px] shrink-0 border-l bg-gray-50/30 dark:bg-gray-900/40 px-6 py-6 space-y-7 overflow-y-auto scrollbar-none">
          {/* Durum Seçici */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Durum
            </Label>
            {editing ? (
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as EditFormData["status"])
                }
              >
                <SelectTrigger className="h-10 bg-white dark:bg-gray-800 border-kanban-border shadow-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Yapılacak</SelectItem>
                  <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                  <SelectItem value="done">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="px-3 py-2 bg-white border rounded font-semibold text-sm text-gray-700">
                {statusLabel[task.status]}
              </div>
            )}
          </div>

          {/* Atananlar */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Atananlar
            </Label>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-kanban-border p-1 shadow-sm">
              <AssigneeSection
                taskId={task.id}
                projectId={projectId}
                assignees={task.assignees}
                canEdit={canEdit()}
              />
            </div>
          </div>

          {/* Öncelik Seçici */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Öncelik
            </Label>
            {editing ? (
              <Select
                value={watch("priority")}
                onValueChange={(v) =>
                  setValue("priority", v as EditFormData["priority"])
                }
              >
                <SelectTrigger className="h-10 bg-white dark:bg-gray-800 border-kanban-border shadow-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem
                    value="critical"
                    className="text-red-600 font-bold"
                  >
                    Kritik
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p
                className={cn(
                  "text-sm font-bold px-1",
                  priorityColor[task.priority],
                )}
              >
                {priorityLabel[task.priority]}
              </p>
            )}
          </div>

          {/* Etiketler */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Etiketler
            </Label>
            <LabelSection
              taskId={task.id}
              projectId={projectId}
              labels={task.labels}
              canEdit={canEdit()}
            />
          </div>

          {/* Tarih ve Bilgi Paneli */}
          <div className="pt-6 border-t space-y-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Vade Tarihi
              </span>
              {editing ? (
                <Input type="date" {...register("due_date")} className="h-9" />
              ) : (
                <div className="text-sm font-medium text-gray-700">
                  {task.due_date ? (
                    new Date(task.due_date).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  ) : (
                    <span className="text-muted-foreground font-normal italic">
                      Belirtilmemiş
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Oluşturuldu
              </span>
              <span className="text-xs text-gray-500">
                {new Date(task.created_at).toLocaleString("tr-TR")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TaskDetailModal (Ana Wrapper) ────────────────────────────

export default function TaskDetailModal() {
  const { taskId, id: projectId } = useParams<{ taskId: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const backgroundLocation = location.state?.backgroundLocation;
  const isModal = !!backgroundLocation;

  const { data: task, isLoading, isError } = useTask(taskId!);

  const handleClose = () => {
    if (isModal) {
      navigate(-1);
    } else {
      navigate(`/projects/${projectId}/board`);
    }
  };

  if (isLoading) {
    return isModal ? (
      <ModalShell onClose={handleClose}>
        <LoadingSpinner fullPage />
      </ModalShell>
    ) : (
      <LoadingSpinner fullPage />
    );
  }

  if (isError || !task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-muted-foreground font-medium">Görev bulunamadı.</p>
        <Button variant="link" onClick={handleClose}>
          Geri dön
        </Button>
      </div>
    );
  }

  if (isModal) {
    return (
      <ModalShell onClose={handleClose}>
        <TaskDetailContent
          task={task}
          projectId={projectId!}
          onClose={handleClose}
        />
      </ModalShell>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto h-screen shadow-2xl">
        <TaskDetailContent
          task={task}
          projectId={projectId!}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-950 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-5xl h-[90vh] mx-4 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {children}
      </div>
    </div>
  );
}
