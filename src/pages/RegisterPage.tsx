import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { registerApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  username: z
    .string()
    .min(3, "Kullanıcı adı en az 3 karakter olmalıdır")
    .max(50, "Kullanıcı adı en fazla 50 karakter olabilir")
    .regex(/^[a-zA-Z0-9_]+$/, "Sadece harf, rakam ve _ içerebilir"),
  email: z.string().min(1, "E-posta zorunludur").email("Geçerli bir e-posta giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  full_name: z
    .string()
    .max(100, "Ad soyad en fazla 100 karakter olabilir")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate, isPending, error } = useMutation({
    mutationFn: registerApi,
    onSuccess: ({ data }) => {
      login(data.data.user, data.data.accessToken, data.data.refreshToken);
      navigate("/dashboard");
    },
  });

  const onSubmit = (data: FormData) => {
    mutate({
      ...data,
      full_name: data.full_name || undefined,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Kayıt Ol</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input id="username" {...register("username")} />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Şifre</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="full_name">Ad Soyad (opsiyonel)</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">
                Bu e-posta veya kullanıcı adı zaten kullanılıyor
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Zaten hesabın var mı?{" "}
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                Giriş Yap
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}