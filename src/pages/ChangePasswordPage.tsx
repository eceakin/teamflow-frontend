import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { changePasswordApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, ShieldAlert } from "lucide-react";

const schema = z
  .object({
    current_password: z.string().min(1, "Mevcut şifre zorunludur"),
    new_password: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır"),
    confirm_password: z.string().min(1, "Şifre tekrarı zorunludur"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Şifreler eşleşmiyor",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      changePasswordApi({
        current_password: data.current_password,
        new_password: data.new_password,
      }),
    onSuccess: () => {
      // Backend tüm refresh token'ları revoke ediyor
      // Frontend store'u temizleyip login'e yönlendiriyoruz
      logout();
      navigate("/login");
    },
    onError: () => {
      setError("current_password", { message: "Mevcut şifre hatalı" });
    },
  });

  const onSubmit = (data: FormData) => mutate(data);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Başlık Bölümü */}
      <div className="px-1">
        <nav className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
          Hesap Ayarları / Güvenlik
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <KeyRound className="size-6 text-blue-600" /> Şifre Yönetimi
        </h1>
      </div>

      <Card className="border-kanban-border shadow-jira-card bg-white overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
          <CardTitle className="text-sm font-bold uppercase tracking-tight text-gray-700">
            Şifreyi Değiştir
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 max-w-md"
          >
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Mevcut Şifre
              </Label>
              <Input
                type="password"
                {...register("current_password")}
                placeholder="Şu anki şifrenizi girin..."
                className="h-10 border-gray-200 bg-gray-50/30 focus:bg-white transition-all font-medium"
              />
              {errors.current_password && (
                <p className="text-[10px] font-bold text-red-500 uppercase mt-1">
                  {errors.current_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Yeni Şifre
              </Label>
              <Input
                type="password"
                {...register("new_password")}
                placeholder="En az 6 karakter..."
                className="h-10 border-gray-200 bg-gray-50/30 focus:bg-white transition-all font-medium"
              />
              {errors.new_password && (
                <p className="text-[10px] font-bold text-red-500 uppercase mt-1">
                  {errors.new_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Yeni Şifre Tekrar
              </Label>
              <Input
                type="password"
                {...register("confirm_password")}
                placeholder="Yeni şifrenizi tekrar girin..."
                className="h-10 border-gray-200 bg-gray-50/30 focus:bg-white transition-all font-medium"
              />
              {errors.confirm_password && (
                <p className="text-[10px] font-bold text-red-500 uppercase mt-1">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-sm uppercase text-xs tracking-widest transition-all"
              >
                {isPending ? "DEĞİŞTİRİLİYOR..." : "ŞİFREYİ GÜNCELLE"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Ek Bilgi (Jira Stili) */}
      <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-4 flex gap-3 items-start">
        <ShieldAlert className="size-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="space-y-2">
          <p className="text-[11px] text-amber-800 leading-relaxed">
            <b>Güvenlik Uyarı:</b> Şifrenizi değiştirdiğinizde, güvenliğiniz
            için diğer tüm cihazlardaki aktif oturumlarınız{" "}
            <strong>otomatik olarak kapatılacaktır</strong>.
          </p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            İşlem başarılı olduktan sonra sistem sizi giriş ekranına
            yönlendirecek ve yeni şifrenizle tekrar giriş yapmanız gerekecektir.
          </p>
        </div>
      </div>
    </div>
  );
}
