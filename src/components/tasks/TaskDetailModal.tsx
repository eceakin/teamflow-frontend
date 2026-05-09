/**
 * TaskDetailModal — Background Location Pattern
 *
 * Kullanım (TasksBoardPage veya TasksListPage içinde):
 *
 *   const navigate = useNavigate();
 *   const location = useLocation();
 *
 *   // Kart tıklandığında:
 *   navigate(`/projects/${projectId}/tasks/${task.id}`, {
 *     state: { backgroundLocation: location },
 *   });
 *
 *   // Route tanımı (ProjectLayout altında):
 *   <Route path="tasks/:taskId" element={<TaskDetailModal />} />
 *
 * Modal kapatıldığında background sayfaya (-1) geri döner.
 * Kullanıcı URL'yi doğrudan açarsa modal değil tam sayfa görünür
 * (backgroundLocation yoksa full-page render edilir).
 */

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { usePermission } from "@/hooks/usePermission";
import AssigneeSection from "./AssigneeSection";
import LabelSection from "./LabelSection";
import CommentSection from "./CommentSection";
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
import { Pencil, Trash2, X, Check } from "lucide-react";
import type { Task } from "@/types/task";

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

  const startEdit = () => {
    reset({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ?? "",
    });
    setEditing(true);
  };

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
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Üst bar ── */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b shrink-0">
        <div className="flex-1 min-w-0">
          {editing ? (
            <Input
              {...register("title")}
              className="text-base font-semibold h-auto py-1"
              autoFocus
            />
          ) : (
            <h2 className="text-base font-semibold leading-snug break-words">
              {task.title}
            </h2>
          )}
          {errors.title && (
            <p className="text-xs text-destructive mt-0.5">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Eylem butonları */}
        <div className="flex items-center gap-1 shrink-0">
          {canEdit() && !editing && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={startEdit}
              aria-label="Düzenle"
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
          {editing && (
            <>
              <Button
                size="icon-sm"
                onClick={handleSubmit(onSubmit)}
                disabled={isUpdating}
                aria-label="Kaydet"
              >
                <Check className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={cancelEdit}
                aria-label="İptal"
              >
                <X className="size-3.5" />
              </Button>
            </>
          )}

          {canDelete() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  aria-label="Sil"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Görevi silmek istediğine emin misin?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu işlem geri alınamaz. Görev ve yorumları kalıcı olarak
                    silinir.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
            aria-label="Kapat"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* ── Ana içerik: iki kolon ── */}
      <div className="flex gap-6 pt-4 flex-1 overflow-hidden">
        {/* Sol: açıklama + meta + yorumlar */}
        <div className="flex-1 min-w-0 overflow-y-auto space-y-5 pr-1">
          {/* Açıklama */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Açıklama
            </Label>
            {editing ? (
              <Textarea
                {...register("description")}
                placeholder="Açıklama ekle..."
                rows={4}
              />
            ) : (
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {task.description || (
                  <span className="text-muted-foreground">Açıklama yok</span>
                )}
              </p>
            )}
          </div>

          {/* Durum + Öncelik */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Durum
              </Label>
              {editing ? (
                <Select
                  value={watch("status")}
                  onValueChange={(v) =>
                    setValue("status", v as EditFormData["status"])
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Yapılacak</SelectItem>
                    <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                    <SelectItem value="done">Tamamlandı</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">{statusLabel[task.status]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Öncelik
              </Label>
              {editing ? (
                <Select
                  value={watch("priority")}
                  onValueChange={(v) =>
                    setValue("priority", v as EditFormData["priority"])
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className={`text-sm ${priorityColor[task.priority]}`}>
                  {priorityLabel[task.priority]}
                </p>
              )}
            </div>
          </div>

          {/* Vade tarihi */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Vade Tarihi
            </Label>
            {editing ? (
              <Input type="date" {...register("due_date")} className="h-8" />
            ) : (
              <p className="text-sm">
                {task.due_date ? (
                  new Date(task.due_date).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                ) : (
                  <span className="text-muted-foreground">Belirtilmemiş</span>
                )}
              </p>
            )}
          </div>

          {/* Oluşturulma */}
          <p className="text-xs text-muted-foreground">
            Oluşturuldu: {new Date(task.created_at).toLocaleString("tr-TR")}
          </p>

          {/* Yorumlar — sadece kaydetme modunda göster */}
          {!editing && (
            <div className="border-t pt-5">
              <CommentSection taskId={task.id} />
            </div>
          )}
        </div>

        {/* Sağ: atananlar + etiketler */}
        <div className="w-48 shrink-0 space-y-6 overflow-y-auto">
          <AssigneeSection
            taskId={task.id}
            projectId={projectId}
            assignees={task.assignees}
            canEdit={canEdit()}
          />
          <LabelSection
            taskId={task.id}
            projectId={projectId}
            labels={task.labels}
            canEdit={canEdit()}
          />
        </div>
      </div>
    </div>
  );
}

// ─── TaskDetailModal (ana bileşen) ────────────────────────────

export default function TaskDetailModal() {
  const { taskId, id: projectId } = useParams<{
    taskId: string;
    id: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const backgroundLocation = location.state?.backgroundLocation;
  const isModal = !!backgroundLocation;

  const { data: task, isLoading, isError } = useTask(taskId!);

  const handleClose = () => {
    if (isModal) {
      navigate(-1);
    } else {
      navigate(`/projects/${projectId}`);
    }
  };

  if (isLoading) {
    return isModal ? (
      <ModalShell onClose={handleClose}>
        <LoadingSpinner fullPage label="Görev yükleniyor..." />
      </ModalShell>
    ) : (
      <LoadingSpinner fullPage label="Görev yükleniyor..." />
    );
  }

  if (isError || !task) {
    return isModal ? (
      <ModalShell onClose={handleClose}>
        <p className="text-center text-muted-foreground py-8">
          Görev bulunamadı.
        </p>
      </ModalShell>
    ) : (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Görev bulunamadı.
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <TaskDetailContent
          task={task}
          projectId={projectId!}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}

// ─── Modal kabuk ──────────────────────────────────────────────

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-popover rounded-xl ring-1 ring-foreground/10 shadow-xl
                   w-full max-w-3xl max-h-[90vh] mx-4 flex flex-col p-6
                   overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
