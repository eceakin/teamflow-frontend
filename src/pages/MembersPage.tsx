import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMembersApi, addMemberApi, removeMemberApi } from "@/lib/api/projects";
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

const roleBadgeVariant: Record<Member["role"], "default" | "secondary" | "outline"> = {
  owner: "default",
  contributor: "secondary",
  viewer: "outline",
};

export default function MembersPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const { canManageMembers } = usePermission(id!);

  const { data: members } = useQuery({
    queryKey: ["members", id],
    queryFn: () => getMembersApi(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "viewer" },
  });

  const { mutate: addMember, isPending: isAdding, error: addError } = useMutation({
    mutationFn: (data: FormData) => addMemberApi(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", id] });
      reset({ role: "viewer", user_id: "" });
    },
  });

  const { mutate: removeMember } = useMutation({
    mutationFn: (userId: string) => removeMemberApi(id!, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", id] }),
  });

  const onSubmit = (data: FormData) => addMember(data);

  return (
    <div className="max-w-2xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Üyeler ({members?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {members?.map((member) => {
            const isOwner = member.role === "owner";
            const isSelf = member.id === currentUser?.id;

            return (
              <div key={member.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(member.full_name || member.username)[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {member.full_name || member.username}
                      {isSelf && (
                        <span className="ml-1 text-xs text-muted-foreground">(sen)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">@{member.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={roleBadgeVariant[member.role]}>
                    {roleLabel[member.role]}
                  </Badge>

                  {canManageMembers() && !isOwner && !isSelf && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          Çıkar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Üyeyi çıkarmak istediğine emin misin?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {member.full_name || member.username} projeden çıkarılacak.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeMember(member.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Çıkar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {canManageMembers() && (
        <Card>
          <CardHeader>
            <CardTitle>Üye Ekle</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label>Kullanıcı ID (UUID)</Label>
                <Input {...register("user_id")} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                {errors.user_id && (
                  <p className="text-sm text-destructive">{errors.user_id.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Rol</Label>
                <Select
                  value={watch("role")}
                  onValueChange={(v) => setValue("role", v as FormData["role"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">İzleyici</SelectItem>
                    <SelectItem value="contributor">Katkıcı</SelectItem>
                    <SelectItem value="owner">Sahip</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {addError && (
                <p className="text-sm text-destructive">
                  Kullanıcı bulunamadı veya zaten üye
                </p>
              )}

              <Button type="submit" disabled={isAdding}>
                {isAdding ? "Ekleniyor..." : "Üye Ekle"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}