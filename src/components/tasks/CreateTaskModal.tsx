import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTask } from "@/hooks/useTasks";
import type { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Şema ────────────────────────────────────────────────────

const schema = z.object({
  title: z
    .string()
    .min(1, "Görev başlığı zorunludur")
    .max(255, "En fazla 255 karakter"),
  description: z
    .string()
    .max(2000, "En fazla 2000 karakter")
    .optional()
    .or(z.literal("")),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["todo", "in_progress", "done"]),
  due_date: z.string().optional().or(z.literal("")),
  sprint_id: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

// ─── Props ───────────────────────────────────────────────────

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  /** Varsayılan sprint — sprint sayfasından açılırsa otomatik seçili gelir */
  defaultSprintId?: string;
  /** Varsayılan durum — kolon başlığından "+" ile açılırsa otomatik seçili */
  defaultStatus?: Task["status"];
  onCreated?: (task: Task) => void;
}

// ─── Bileşen ──────────────────────────────────────────────────

export default function CreateTaskModal({
  open,
  onOpenChange,
  projectId,
  defaultSprintId,
  defaultStatus = "todo",
  onCreated,
}: CreateTaskModalProps) {
  const { mutate: createTask, isPending } = useCreateTask(projectId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: defaultStatus,
      priority: "medium",
      sprint_id: defaultSprintId ?? "",
    },
  });

  const onSubmit = (data: FormData) => {
    createTask(
      {
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        status: data.status,
        due_date: data.due_date || undefined,
        sprint_id: data.sprint_id || undefined,
      },
      {
        onSuccess: (task) => {
          onCreated?.(task);
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni Görev Oluştur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
          {/* Başlık */}
          <div className="space-y-1">
            <Label htmlFor="ct-title">Başlık *</Label>
            <Input
              id="ct-title"
              {...register("title")}
              placeholder="Görev başlığını girin"
              autoFocus
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Açıklama */}
          <div className="space-y-1">
            <Label htmlFor="ct-desc">Açıklama</Label>
            <Textarea
              id="ct-desc"
              {...register("description")}
              placeholder="İsteğe bağlı açıklama..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Öncelik + Durum yan yana */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Öncelik</Label>
              <Select
                value={watch("priority")}
                onValueChange={(v) =>
                  setValue("priority", v as FormData["priority"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="critical">Kritik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Durum</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as FormData["status"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Yapılacak</SelectItem>
                  <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                  <SelectItem value="done">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vade tarihi */}
          <div className="space-y-1">
            <Label htmlFor="ct-due">Vade Tarihi</Label>
            <Input id="ct-due" type="date" {...register("due_date")} />
          </div>

          {/* Butonlar */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
