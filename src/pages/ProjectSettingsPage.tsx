import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjectApi,
  updateProjectApi,
  deleteProjectApi,
} from "@/lib/api/projects";
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
import { useEffect } from "react";
import { Settings, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

const schema = z.object({
  title: z
    .string()
    .min(1, "Proje başlığı zorunludur")
    .max(150, "En fazla 150 karakter"),
  description: z
    .string()
    .max(1000, "En fazla 1000 karakter")
    .optional()
    .or(z.literal("")),
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

  // SORUNUN ÇÖZÜLDÜĞÜ YER: defaultValues eklendi
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      status: "active", // Başlangıçta boş kalıp hata vermesini engeller
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        description: project.description ?? "",
        status: project.status as "active" | "archived" | "completed",
      });
    }
  }, [project, reset]);

  const {
    mutate: updateProject,
    isPending: isUpdating,
    isSuccess: isUpdateSuccess,
  } = useMutation({
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Başlık Bölümü */}
      <div className="px-1">
        <nav className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
          Proje Yönetimi / Ayarlar
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Settings className="size-6 text-blue-600" /> Proje Ayarları
        </h1>
      </div>

      <Card className="border-kanban-border shadow-jira-card bg-white overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
          <CardTitle className="text-sm font-bold uppercase tracking-tight text-gray-700">
            Genel Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 max-w-2xl">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Proje Adı
                </Label>
                <Input
                  {...register("title")}
                  placeholder="Projenin adını girin..."
                  className="h-10 border-gray-200 bg-gray-50/30 focus:bg-white transition-all font-medium text-gray-900 shadow-sm"
                />
                {errors.title && (
                  <p className="text-[10px] font-bold text-red-500 uppercase mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Açıklama
                </Label>
                <Textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Projenin amacını ve detaylarını açıklayın..."
                  className="min-h-[100px] border-gray-200 bg-gray-50/30 focus:bg-white transition-all font-medium text-gray-900 resize-y shadow-sm"
                />
                {errors.description && (
                  <p className="text-[10px] font-bold text-red-500 uppercase mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Durum
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-10 bg-gray-50/30 border-gray-200 focus:bg-white focus:ring-0 focus:ring-offset-0 font-medium shadow-sm">
                        <SelectValue placeholder="Durum seçin..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 shadow-xl rounded-md">
                        <SelectItem
                          value="active"
                          className="cursor-pointer font-medium focus:bg-blue-50"
                        >
                          Aktif
                        </SelectItem>
                        <SelectItem
                          value="completed"
                          className="cursor-pointer font-medium focus:bg-blue-50"
                        >
                          Tamamlandı
                        </SelectItem>
                        <SelectItem
                          value="archived"
                          className="cursor-pointer font-medium focus:bg-blue-50"
                        >
                          Arşivlendi
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-[10px] font-bold text-red-500 uppercase mt-1">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-sm uppercase text-xs tracking-widest transition-all h-10"
              >
                {isUpdating ? "KAYDEDİLİYOR..." : "DEĞİŞİKLİKLERİ KAYDET"}
              </Button>
              {isUpdateSuccess && (
                <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300 bg-green-50 px-3 py-1.5 rounded-md border border-green-200">
                  <CheckCircle2 className="size-4 text-green-600" />
                  <p className="text-[11px] font-bold text-green-700 uppercase tracking-tight mt-0.5">
                    Başarıyla güncellendi
                  </p>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Ek Bilgi (Jira Stili) */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start max-w-4xl shadow-sm">
        <Info className="size-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
            <strong className="font-bold mr-1 uppercase tracking-widest">
              Not:
            </strong>
            Proje adı ve açıklaması projeye dahil olan tüm üyeler tarafından
            görülebilir. Proje durumunu "Arşivlendi" olarak değiştirmek, projeyi
            ana listeden gizleyecektir.
          </p>
        </div>
      </div>

      {canDelete() && (
        <Card className="border-red-200 shadow-sm bg-white overflow-hidden mt-12">
          <CardHeader className="bg-red-50/50 border-b border-red-100 p-6">
            <CardTitle className="text-sm font-bold uppercase tracking-tight text-red-700 flex items-center gap-2">
              <AlertTriangle className="size-4" /> Tehlikeli Bölge
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1 max-w-lg">
                <h4 className="text-sm font-bold text-gray-900">Projeyi Sil</h4>
                <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                  Bu işlem geri alınamaz. Proje silindiğinde projeye ait olan
                  tüm görevler, sprintler, yorumlar ve eklentiler kalıcı olarak
                  veri tabanından silinecektir.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm uppercase text-xs tracking-widest transition-all whitespace-nowrap h-10 px-6"
                  >
                    {isDeleting ? "SİLİNİYOR..." : "PROJEYİ SİL"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-red-200 bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600 font-bold text-lg">
                      <AlertTriangle className="size-5" />
                      Emin misiniz?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-gray-600 font-medium pt-2 leading-relaxed">
                      <strong className="text-gray-900">
                        "{project?.title}"
                      </strong>{" "}
                      adlı projeyi silmek üzeresiniz. Bu işlem kesinlikle geri
                      alınamaz ve projeye ait tüm veriler (görevler, dosyalar,
                      yorumlar) kalıcı olarak yok edilir.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6 border-t border-gray-100 pt-4">
                    <AlertDialogCancel className="font-bold text-gray-600 uppercase text-xs tracking-widest hover:bg-gray-100">
                      İptal Et
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteProject()}
                      className="bg-red-600 text-white hover:bg-red-700 font-bold uppercase text-xs tracking-widest shadow-sm"
                    >
                      EVET, PROJEYİ SİL
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
