import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTasksApi } from "@/lib/api/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectOverview() {
  const { id: projectId } = useParams<{ id: string }>();

  // Görevleri çekiyoruz
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => getTasksApi(projectId!).then((r) => r.data.data),
    enabled: !!projectId,
  });

  // İstatistikleri istemci tarafında hesaplıyoruz (API'den bağımsız kesin çözüm)
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t: any) => t.status === "todo").length,
    inProgress: tasks.filter((t: any) => t.status === "in_progress").length,
    done: tasks.filter((t: any) => t.status === "done").length,
  };

  const statCards = [
    {
      title: "TOPLAM GÖREV",
      value: stats.total,
      icon: Layout,
      color: "text-gray-900",
      bg: "bg-gray-100",
    },
    {
      title: "YAPILACAK",
      value: stats.todo,
      icon: Circle,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "DEVAM EDEN",
      value: stats.inProgress,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "TAMAMLANAN",
      value: stats.done,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Üst Bilgi */}
      <div>
        <nav className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
          Proje Panosu
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Genel Bakış
        </h1>
      </div>

      {/* İstatistik Kartları - Jira Stili */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card
            key={i}
            className="border-kanban-border shadow-jira-card bg-white overflow-hidden"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-md", stat.bg)}>
                <stat.icon className={cn("size-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter">
                {stat.value}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">
                {isLoading ? "Güncelleniyor..." : "Güncel Veri"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Son Aktiviteler Kısmı */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700">
          Son Aktiviteler
        </h2>
        <Card className="border-kanban-border shadow-jira-card bg-white min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="size-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
              <Clock className="size-6 text-gray-300" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Henüz bir aktivite kaydedilmedi.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
