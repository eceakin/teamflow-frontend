import { useParams } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLabelsApi, createLabelApi, deleteLabelApi } from "@/lib/api/labels";
import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  name: z
    .string()
    .min(1, "Etiket adı zorunludur")
    .max(50, "En fazla 50 karakter"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir hex renk kodu giriniz"),
});

type FormData = z.infer<typeof schema>;

export default function LabelsPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { canEdit } = usePermission(id!);
  const [pickerColor, setPickerColor] = useState("#6B7280");

  const { data: labels } = useQuery({
    queryKey: ["labels", id],
    queryFn: () => getLabelsApi(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { color: "#6B7280" },
  });

  const { mutate: createLabel, isPending } = useMutation({
    mutationFn: (data: FormData) => createLabelApi(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["labels", id] });
      reset({ color: "#6B7280", name: "" });
      setPickerColor("#6B7280");
    },
  });

  const { mutate: deleteLabel } = useMutation({
    mutationFn: deleteLabelApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["labels", id] }),
  });

  const onSubmit = (data: FormData) => createLabel(data);

  return (
    <div className="max-w-2xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Etiketler ({labels?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {!labels || labels.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Henüz etiket yok</p>
          ) : (
            labels.map((label) => (
              <div key={label.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm font-medium">{label.name}</span>
                </div>
                {canEdit() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteLabel(label.id)}
                  >
                    Sil
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {canEdit() && (
        <Card>
          <CardHeader>
            <CardTitle>Yeni Etiket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label>Etiket Adı</Label>
                <Input {...register("name")} placeholder="örn: Acil, Frontend, Bug" />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Renk</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={pickerColor}
                    onChange={(e) => {
                      setPickerColor(e.target.value);
                      setValue("color", e.target.value, { shouldValidate: true });
                    }}
                    className="h-10 w-14 cursor-pointer rounded border border-input bg-transparent p-1"
                  />
                  <Input
                    {...register("color")}
                    value={pickerColor}
                    onChange={(e) => {
                      setPickerColor(e.target.value);
                      setValue("color", e.target.value, { shouldValidate: true });
                    }}
                    placeholder="#6B7280"
                    className="font-mono"
                  />
                </div>
                {errors.color && (
                  <p className="text-sm text-destructive">{errors.color.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending ? "Oluşturuluyor..." : "Oluştur"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}