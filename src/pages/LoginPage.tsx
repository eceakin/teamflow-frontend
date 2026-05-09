import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { loginApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  email: z.string().min(1, "E-posta zorunludur").email("Geçerli bir e-posta giriniz"),
  password: z.string().min(1, "Şifre zorunludur"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate, isPending, error } = useMutation({
    mutationFn: loginApi,
    onSuccess: ({ data }) => {
      login(data.data.user, data.data.accessToken, data.data.refreshToken);
      navigate("/dashboard");
    },
  });

  const onSubmit = (data: FormData) => mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Giriş Yap</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            {error && (
              <p className="text-sm text-destructive text-center">
                E-posta veya şifre hatalı
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Hesabın yok mu?{" "}
              <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                Kayıt Ol
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}