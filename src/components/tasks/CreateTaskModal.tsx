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

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  defaultSprintId?: string;
  defaultStatus?: Task["status"];
  onCreated?: (task: Task) => void;
}

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
      {/* DÜZELTME: p-0 kaldırıldı, p-8 ile bütünleşik beyaz zemin sağlandı */}
      <DialogContent className="sm:max-w-xl p-8 border-none shadow-2xl bg-white dark:bg-gray-900 overflow-hidden outline-none">
        <DialogHeader className="p-0 mb-6 space-y-2">
          <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Yeni Görev Oluştur
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Projeniz için yeni bir görev tanımlayın ve detayları ekleyin.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Başlık */}
          <div className="space-y-2">
            <Label
              htmlFor="ct-title"
              className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
            >
              Başlık <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ct-title"
              {...register("title")}
              className="h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
              placeholder="Ne yapılması gerekiyor?"
              autoFocus
            />
            {errors.title && (
              <p className="text-xs font-semibold text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Açıklama */}
          <div className="space-y-2">
            <Label
              htmlFor="ct-desc"
              className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
            >
              Açıklama
            </Label>
            <Textarea
              id="ct-desc"
              {...register("description")}
              className="min-h-[140px] bg-gray-50 dark:bg-gray-800 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all resize-none p-3 leading-relaxed"
              placeholder="Görev detaylarını buraya yazın..."
            />
          </div>

          {/* Öncelik + Durum */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Öncelik
              </Label>
              <Select
                value={watch("priority")}
                onValueChange={(v) =>
                  setValue("priority", v as FormData["priority"])
                }
              >
                <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-[110] shadow-xl">
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
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Durum
              </Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as FormData["status"])
                }
              >
                <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-[110] shadow-xl">
                  <SelectItem value="todo">Yapılacak</SelectItem>
                  <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                  <SelectItem value="done">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vade tarihi */}
          <div className="space-y-2">
            <Label
              htmlFor="ct-due"
              className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
            >
              Vade Tarihi
            </Label>
            <Input
              id="ct-due"
              type="date"
              {...register("due_date")}
              className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
            />
          </div>

          {/* Alt Aksiyonlar */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="font-bold text-gray-500 hover:text-gray-700"
            >
              İPTAL
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-sm transition-all active:scale-95"
            >
              {isPending ? "OLUŞTURULUYOR..." : "GÖREVİ OLUŞTUR"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
