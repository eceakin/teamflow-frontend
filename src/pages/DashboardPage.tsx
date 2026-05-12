import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectsApi, createProjectApi } from "@/lib/api/projects";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from "@/components/shared/Navbar";
import { Plus, Layout, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Şema ────────────────────────────────────────────────────
const schema = z.object({
  title: z
    .string()
    .min(1, "Proje başlığı zorunludur")
    .max(150, "Proje başlığı en fazla 150 karakter olabilir"),
  description: z
    .string()
    .max(1000, "Açıklama en fazla 1000 karakter olabilir")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjectsApi().then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "" },
  });

  const { mutate: createProject, isPending } = useMutation({
    mutationFn: createProjectApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      reset();
      setOpen(false);
    },
  });

  // VERİ GÖNDERME MANTIĞI (Eski çalışan kodun aynısı)
  const onSubmit = (data: FormData) => {
    createProject({ ...data, description: data.description || undefined });
  };

  const statusLabel: Record<Project["status"], string> = {
    active: "AKTİF",
    archived: "ARŞİVLENDİ",
    completed: "TAMAMLANDI",
  };

  const statusClass: Record<Project["status"], string> = {
    active: "bg-green-50 text-green-700 border-green-200",
    archived: "bg-gray-100 text-gray-600 border-gray-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 py-10 space-y-8">
        {/* Üst Bar */}
        <div className="flex items-end justify-between border-b border-gray-200 pb-6">
          <div className="space-y-1">
            <nav className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Genel Bakış
            </nav>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Projelerim
            </h1>
          </div>

          <Dialog
            open={open}
            onOpenChange={(val) => {
              setOpen(val);
              if (!val) reset();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm px-6">
                <Plus className="size-4 mr-2" /> PROJE OLUŞTUR
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] p-8 border-none shadow-2xl bg-white dark:bg-gray-900 outline-none">
              <DialogHeader className="p-0 mb-6 space-y-2">
                <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Yeni Proje Oluştur
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Ekibinizle beraber görevleri yönetmek için yeni bir çalışma
                  alanı başlatın.
                </p>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                  >
                    Proje Başlığı <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Örn: E-Ticaret Yenileme Süreci"
                    className="h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                    autoFocus
                  />
                  {errors.title && (
                    <p className="text-xs font-semibold text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                  >
                    Açıklama (Opsiyonel)
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Projenin amacını kısaca belirtin..."
                    className="min-h-[120px] bg-gray-50 dark:bg-gray-800 border-gray-200 focus:bg-white transition-all resize-none p-3"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    className="font-bold text-gray-500 hover:text-gray-700 dark:hover:bg-gray-800"
                  >
                    İPTAL
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 font-bold px-8 shadow-sm text-white"
                  >
                    {isPending ? "OLUŞTURULUYOR..." : "OLUŞTUR"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Proje Listesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-gray-200/50 animate-pulse border border-gray-200"
              />
            ))
          ) : data?.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white rounded-xl border-2 border-dashed border-gray-200 dark:bg-gray-900 dark:border-gray-800">
              <Layout className="size-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">
                Henüz Proje Yok
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Hemen bir proje oluşturarak iş akışınızı yönetmeye başlayın.
              </p>
            </div>
          ) : (
            data?.map((project) => (
              <Card
                key={project.id}
                className="group cursor-pointer border-kanban-border shadow-jira-card hover:shadow-md hover:border-blue-300 transition-all bg-white dark:bg-gray-900 overflow-hidden"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="size-10 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center text-blue-600 mb-3 font-bold uppercase">
                      <Layout className="size-5" />
                    </div>
                    <Badge
                      className={cn(
                        "text-[9px] font-black tracking-tighter px-2 py-0.5 rounded border shadow-none",
                        statusClass[project.status as keyof typeof statusClass],
                      )}
                    >
                      {statusLabel[project.status as keyof typeof statusLabel]}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-2 text-sm leading-relaxed min-h-[40px]">
                    {project.description ||
                      "Bu proje için henüz bir açıklama girilmemiş."}
                  </CardDescription>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="size-3.5" />
                      <span className="text-[11px] font-bold uppercase tracking-tight">
                        {new Date(project.created_at).toLocaleDateString(
                          "tr-TR",
                        )}
                      </span>
                    </div>
                    <ChevronRight className="size-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium border uppercase tracking-tighter",
        className,
      )}
    >
      {children}
    </span>
  );
}
