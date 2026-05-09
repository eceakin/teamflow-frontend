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
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate: createProject, isPending } = useMutation({
    mutationFn: createProjectApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      reset();
      setOpen(false);
    },
  });

  const onSubmit = (data: FormData) => {
    createProject({ ...data, description: data.description || undefined });
  };

  const statusLabel: Record<Project["status"], string> = {
    active: "Aktif",
    archived: "Arşivlendi",
    completed: "Tamamlandı",
  };

  const statusColor: Record<Project["status"], string> = {
    active: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-600",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Ortak Navbar (logo + bildirim + profil + çıkış) ── */}
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Projelerim</h2>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>+ Proje Oluştur</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Proje</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 mt-2"
              >
                <div className="space-y-1">
                  <Label htmlFor="title">Proje Adı</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Proje adını girin"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description">Açıklama (opsiyonel)</Label>
                  <Input
                    id="description"
                    {...register("description")}
                    placeholder="Kısa bir açıklama"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Oluşturuluyor..." : "Oluştur"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Yükleniyor iskelet */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {/* Boş durum */}
        {!isLoading && data?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            Henüz projen yok. İlk projeyi oluştur!
          </div>
        )}

        {/* Proje kartları */}
        {!isLoading && data && data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      {project.title}
                    </CardTitle>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${statusColor[project.status]}`}
                    >
                      {statusLabel[project.status]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2">
                    {project.description || "Açıklama yok"}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(project.created_at).toLocaleDateString("tr-TR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
