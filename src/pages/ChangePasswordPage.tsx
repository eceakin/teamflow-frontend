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
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Şifre Değiştir</h2>
        <p className="text-sm text-muted-foreground">
          Şifreni değiştirdiğinde tüm oturumların kapatılır
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
            <div className="space-y-1">
              <Label>Mevcut Şifre</Label>
              <Input type="password" {...register("current_password")} />
              {errors.current_password && (
                <p className="text-sm text-destructive">{errors.current_password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Yeni Şifre</Label>
              <Input type="password" {...register("new_password")} />
              {errors.new_password && (
                <p className="text-sm text-destructive">{errors.new_password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Yeni Şifre Tekrar</Label>
              <Input type="password" {...register("confirm_password")} />
              {errors.confirm_password && (
                <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}