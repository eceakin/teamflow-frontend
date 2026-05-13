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
import { Tags, Plus, Trash2 } from "lucide-react";

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

  const { mutate: deleteLabel, isPending: isDeleting } = useMutation({
    mutationFn: deleteLabelApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["labels", id] }),
  });

  const onSubmit = (data: FormData) => createLabel(data);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Üst Başlık */}
      <div className="px-1">
        <nav className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
          Proje Ayarları / İş Akışı
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Tags className="size-6 text-blue-600" /> Etiket Yönetimi
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* SOL: Etiket Listesi */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-kanban-border shadow-jira-card bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
              <CardTitle className="text-sm font-bold uppercase tracking-tight text-gray-700 flex items-center justify-between">
                <span>Mevcut Etiketler</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-[10px]">
                  {labels?.length ?? 0} ADET
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!labels || labels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <Tags className="size-10 text-gray-200 mb-3" />
                  <p className="text-sm font-semibold text-gray-700">
                    Henüz etiket yok
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
                    Görevleri kategorize etmek için sağ taraftaki paneli
                    kullanarak yeni etiketler oluşturabilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {labels.map((label) => (
                    <div
                      key={label.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded shadow-sm border border-black/10 shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span
                          className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded border"
                          style={{
                            backgroundColor: label.color + "15",
                            borderColor: label.color + "30",
                            color: label.color,
                          }}
                        >
                          {label.name}
                        </span>
                      </div>
                      {canEdit() && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-md"
                          onClick={() => deleteLabel(label.id)}
                          disabled={isDeleting}
                          title="Etiketi Sil"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SAĞ: Yeni Etiket Ekleme Formu */}
        {canEdit() && (
          <div className="space-y-4">
            <Card className="border-kanban-border shadow-jira-card bg-white sticky top-24">
              <CardHeader className="p-5 border-b border-gray-100">
                <CardTitle className="text-sm font-bold uppercase tracking-tight text-gray-700 flex items-center gap-2">
                  <Plus className="size-4" /> Yeni Etiket Oluştur
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Etiket Adı
                    </Label>
                    <Input
                      {...register("name")}
                      placeholder="örn: Acil, Frontend, Bug"
                      className="h-10 border-gray-200 bg-gray-50/30 focus:bg-white transition-all font-medium text-xs"
                    />
                    {errors.name && (
                      <p className="text-[10px] font-bold text-red-500 uppercase">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Renk Kodu (HEX)
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="color"
                          value={pickerColor}
                          onChange={(e) => {
                            setPickerColor(e.target.value);
                            setValue("color", e.target.value, {
                              shouldValidate: true,
                            });
                          }}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          title="Renk Seçici"
                        />
                        <div
                          className="h-10 w-12 rounded-md border border-gray-200 shadow-sm flex items-center justify-center cursor-pointer"
                          style={{ backgroundColor: pickerColor }}
                        />
                      </div>
                      <Input
                        {...register("color")}
                        value={pickerColor}
                        onChange={(e) => {
                          setPickerColor(e.target.value);
                          setValue("color", e.target.value, {
                            shouldValidate: true,
                          });
                        }}
                        placeholder="#6B7280"
                        className="h-10 flex-1 border-gray-200 bg-gray-50/30 focus:bg-white transition-all font-mono text-xs font-bold uppercase"
                      />
                    </div>
                    {errors.color && (
                      <p className="text-[10px] font-bold text-red-500 uppercase mt-1">
                        {errors.color.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-sm uppercase text-xs tracking-widest transition-all"
                    >
                      {isPending ? "OLUŞTURULUYOR..." : "ETİKETİ OLUŞTUR"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
