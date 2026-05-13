import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMeApi, updateProfileApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BadgeCheck, Copy } from "lucide-react";

const schema = z.object({
  full_name: z
    .string()
    .max(100, "Ad soyad en fazla 100 karakter olabilir")
    .optional()
    .or(z.literal("")),
  avatar_url: z
    .string()
    .url("Geçerli bir URL giriniz")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.login);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const [copied, setCopied] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => getMeApi().then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name ?? "",
        avatar_url: user.avatar_url ?? "",
      });
    }
  }, [user, reset]);

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: FormData) =>
      updateProfileApi({
        full_name: data.full_name || undefined,
        avatar_url: data.avatar_url || undefined,
      }),
    onSuccess: ({ data }) => {
      qc.invalidateQueries({ queryKey: ["me"] });
      if (accessToken && refreshToken) {
        setUser(data.data, accessToken, refreshToken);
      }
    },
  });

  const onSubmit = (data: FormData) => mutate(data);

  const displayName = user?.full_name || user?.username || "";
  const avatarPreview = watch("avatar_url");

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Başlık Bölümü */}
      <div className="px-1">
        <nav className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
          Hesap Ayarları
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Profil Yönetimi
        </h1>
      </div>

      <Card className="border-kanban-border shadow-jira-card bg-white overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                <AvatarImage
                  src={avatarPreview || user?.avatar_url || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-bold bg-blue-600 text-white">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {displayName}
                </h2>
                <BadgeCheck className="size-5 text-blue-500 fill-blue-50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground italic">
                @{user?.username}
              </p>
              <p className="text-sm text-gray-500 font-medium">{user?.email}</p>

              {/* Kullanıcı ID Gösterim ve Kopyalama Alanı */}
              <div className="flex flex-col sm:flex-row items-center gap-2 mt-3 pt-2">
                <code className="bg-white border border-gray-200 text-xs py-1.5 px-3 rounded-md font-mono text-gray-600 shadow-sm">
                  ID: {user?.id || "Yükleniyor..."}
                </code>
                {user?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handleCopyId}
                    className="h-8 text-xs px-3 hover:bg-gray-100 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    {copied ? "Kopyalandı!" : "ID'yi Kopyala"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Ad Soyad
                </Label>
                <Input
                  {...register("full_name")}
                  placeholder="örn: Betül Sarı"
                  className="h-10 border-gray-200 bg-gray-50/30 focus:bg-white transition-all font-medium"
                />
                {errors.full_name && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Profil Fotoğrafı URL
                </Label>
                <Input
                  {...register("avatar_url")}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="h-10 border-gray-200 bg-gray-50/30 focus:bg-white transition-all font-mono text-xs"
                />
                {errors.avatar_url && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.avatar_url.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-sm"
              >
                {isPending ? "GÜNCELLENİYOR..." : "DEĞİŞİKLİKLERİ KAYDET"}
              </Button>
              {isSuccess && (
                <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                  <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-xs font-bold text-green-600 uppercase tracking-tight">
                    Başarıyla güncellendi
                  </p>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Ek Bilgi (Jira Stili) */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start">
        <div className="text-blue-600 mt-0.5">ℹ️</div>
        <div className="space-y-2">
          <p className="text-[11px] text-blue-700 leading-relaxed">
            <b>Not:</b> Profil bilgileriniz ekip arkadaşlarınız tarafından
            projelerde görülecektir. Profil fotoğrafı olarak geçerli bir resim
            linki kullandığınızdan emin olun.
          </p>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            <b>Projeye Davet:</b> Bir projeye katılmak için yukarıdaki{" "}
            <strong>ID'nizi kopyalayıp</strong> sizi davet edecek proje
            yöneticisine iletebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
