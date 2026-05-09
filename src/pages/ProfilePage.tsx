import { useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Profil Bilgileri</h2>
        <p className="text-sm text-muted-foreground">Ad, soyad ve profil fotoğrafını güncelle</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarPreview || user?.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{displayName}</CardTitle>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Ad Soyad</Label>
              <Input {...register("full_name")} placeholder="Adın ve soyadın" />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Profil Fotoğrafı URL</Label>
              <Input
                {...register("avatar_url")}
                placeholder="https://example.com/avatar.jpg"
              />
              {errors.avatar_url && (
                <p className="text-sm text-destructive">{errors.avatar_url.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              {isSuccess && (
                <p className="text-sm text-green-600">Profil güncellendi</p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}