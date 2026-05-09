import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectApi, updateProjectApi, deleteProjectApi } from "@/lib/api/projects";
import { usePermission } from "@/hooks/usePermission";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

const schema = z.object({
  title: z
    .string()
    .min(1, "Proje başlığı zorunludur")
    .max(150, "En fazla 150 karakter"),
  description: z.string().max(1000, "En fazla 1000 karakter").optional().or(z.literal("")),
  status: z.enum(["active", "archived", "completed"]),
});

type FormData = z.infer<typeof schema>;

export default function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { canDelete } = usePermission(id!);

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectApi(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        description: project.description ?? "",
        status: project.status,
      });
    }
  }, [project, reset]);

  const { mutate: updateProject, isPending: isUpdating } = useMutation({
    mutationFn: (data: FormData) => updateProjectApi(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project", id] });
    },
  });

  const { mutate: deleteProject, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteProjectApi(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      navigate("/dashboard");
    },
  });

  const onSubmit = (data: FormData) => {
    updateProject({ ...data, description: data.description || undefined });
  };

  return (
    <div className="max-w-2xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Proje Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Proje Adı</Label>
              <Input {...register("title")} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Açıklama</Label>
              <Textarea {...register("description")} rows={3} />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Durum</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as FormData["status"], { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="archived">Arşivlendi</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {canDelete() && (
        <>
          <Separator />
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Tehlikeli Bölge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Projeyi silmek geri alınamaz. Tüm görevler, sprintler ve yorumlar silinir.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    Projeyi Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Projeyi silmek istediğine emin misin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bu işlem geri alınamaz. Projeye ait tüm veriler kalıcı olarak silinir.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteProject()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Evet, Sil
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}