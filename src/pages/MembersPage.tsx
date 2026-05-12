import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMembersApi,
  addMemberApi,
  removeMemberApi,
} from "@/lib/api/projects";
import { usePermission } from "@/hooks/usePermission";
import { useAuthStore } from "@/store/authStore";
import type { Member } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { UserPlus, Shield, User, X, Users, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Şema ────────────────────────────────────────────────────

const schema = z.object({
  user_id: z.string().uuid("Geçerli bir kullanıcı ID giriniz"),
  role: z.enum(["owner", "contributor", "viewer"]),
});

type FormData = z.infer<typeof schema>;

const roleLabel: Record<Member["role"], string> = {
  owner: "Sahip",
  contributor: "Katkıcı",
  viewer: "İzleyici",
};

const roleClass: Record<Member["role"], string> = {
  owner: "bg-purple-50 text-purple-700 border-purple-100",
  contributor: "bg-blue-50 text-blue-700 border-blue-100",
  viewer: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function MembersPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const { canManageMembers } = usePermission(id!);

  // Veri Çekme
  const { data: members } = useQuery({
    queryKey: ["members", id],
    queryFn: () => getMembersApi(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  // Form Yönetimi
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "viewer", user_id: "" },
  });

  // Üye Ekleme Mutasyonu
  const {
    mutate: addMember,
    isPending: isAdding,
    error: addError,
  } = useMutation({
    mutationFn: (data: FormData) => addMemberApi(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", id] });
      reset({ role: "viewer", user_id: "" });
    },
  });

  // Üye Çıkarma Mutasyonu
  const { mutate: removeMember, isPending: isRemoving } = useMutation({
    mutationFn: (userId: string) => removeMemberApi(id!, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", id] }),
  });

  const onSubmit = (data: FormData) => addMember(data);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Üst Başlık */}
      <div className="px-1">
        <nav className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
          Proje Ayarları / Üyeler
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Users className="size-6 text-blue-600" /> Üyeler
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* SOL: Üye Listesi */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-kanban-border shadow-jira-card bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-sm font-bold uppercase tracking-tight text-gray-700">
                Mevcut Üyeler ({members?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {members?.map((member) => {
                  const isOwner = member.role === "owner";
                  const isSelf = member.id === currentUser?.id;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="size-10 border-2 border-white shadow-sm">
                          <AvatarImage src={member.avatar_url ?? undefined} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                            {(member.full_name ||
                              member.username)[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900">
                              {member.full_name || member.username}
                            </p>
                            {isSelf && (
                              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">
                                Siz
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            @{member.username}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge
                          className={cn(
                            "text-[10px] font-black uppercase px-2 py-1 shadow-none border",
                            roleClass[member.role],
                          )}
                        >
                          {roleLabel[member.role]}
                        </Badge>

                        {canManageMembers() && !isOwner && !isSelf && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-gray-400 hover:text-red-600 transition-all rounded-full"
                              >
                                <X className="size-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Üyeyi Projeden Çıkar
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  <span className="font-bold text-gray-900">
                                    {member.full_name || member.username}
                                  </span>{" "}
                                  projeden çıkarılacak. Onaylıyor musunuz?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="font-bold">
                                  İptal
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeMember(member.id)}
                                  className="bg-red-600 hover:bg-red-700 font-bold"
                                  disabled={isRemoving}
                                >
                                  {isRemoving
                                    ? "ÇIKARILIYOR..."
                                    : "EVET, ÇIKAR"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SAĞ: Üye Ekleme Formu */}
        <div className="space-y-4">
          {canManageMembers() && (
            <Card className="border-kanban-border shadow-jira-card bg-white sticky top-24">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-tight text-gray-700">
                  Yeni Üye Davet Et
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Kullanıcı ID (UUID)
                    </Label>
                    <div className="relative">
                      <Input
                        {...register("user_id")}
                        placeholder="xxxxxxxx-xxxx-xxxx..."
                        className="h-10 bg-gray-50 focus:bg-white transition-all pl-9 text-xs font-mono border-gray-200"
                      />
                      <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
                    </div>
                    {errors.user_id && (
                      <p className="text-[10px] font-bold text-red-500 uppercase">
                        {errors.user_id.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Rol Atama
                    </Label>
                    <Select
                      value={watch("role")}
                      onValueChange={(v) =>
                        setValue("role", v as FormData["role"])
                      }
                    >
                      <SelectTrigger className="h-12 bg-gray-50 border-gray-200 focus:ring-0 focus:ring-offset-0">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent
                        position="popper"
                        sideOffset={5}
                        className="z-[100] min-w-[240px] bg-white border border-gray-200 shadow-xl rounded-md p-1"
                      >
                        <SelectItem
                          value="viewer"
                          className="focus:bg-blue-50 cursor-pointer rounded-sm p-2 outline-none"
                        >
                          <div className="flex items-center gap-3">
                            <User className="size-4 text-gray-500" />
                            <div className="flex flex-col">
                              <span className="font-bold text-xs text-gray-900">
                                İzleyici
                              </span>
                              <span className="text-[10px] text-muted-foreground leading-tight">
                                Sadece okuma yetkisi.
                              </span>
                            </div>
                          </div>
                        </SelectItem>

                        <SelectItem
                          value="contributor"
                          className="focus:bg-blue-50 cursor-pointer rounded-sm p-2 outline-none"
                        >
                          <div className="flex items-center gap-3">
                            <UserPlus className="size-4 text-blue-600" />
                            <div className="flex flex-col">
                              <span className="font-bold text-xs text-blue-600">
                                Katkıcı
                              </span>
                              <span className="text-[10px] text-muted-foreground leading-tight">
                                Görev oluşturma ve düzenleme.
                              </span>
                            </div>
                          </div>
                        </SelectItem>

                        <SelectItem
                          value="owner"
                          className="focus:bg-blue-50 cursor-pointer rounded-sm p-2 outline-none"
                        >
                          <div className="flex items-center gap-3">
                            <Shield className="size-4 text-purple-600" />
                            <div className="flex flex-col">
                              <span className="font-bold text-xs text-purple-600">
                                Sahip
                              </span>
                              <span className="text-[10px] text-muted-foreground leading-tight">
                                Tam yetki ve yönetim.
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {addError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded text-[11px] font-bold text-red-600 text-center uppercase tracking-tighter">
                      Kullanıcı bulunamadı veya zaten üye
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isAdding}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-sm uppercase text-xs tracking-widest transition-all"
                  >
                    {isAdding ? "EKLENİYOR..." : "ÜYEYİ EKLE"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
