import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStatisticsApi, getActivitiesApi } from "@/lib/api/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Activity } from "@/types";

const actionLabel: Record<string, string> = {
  task_created: "görev oluşturdu",
  task_updated: "görevi güncelledi",
  task_status_changed: "görev durumunu değiştirdi",
  task_deleted: "görevi sildi",
  member_added: "üye ekledi",
  member_removed: "üye çıkardı",
  sprint_started: "sprint başlattı",
  sprint_ended: "sprinti bitirdi",
  comment_added: "yorum ekledi",
};

function ActivityItem({ activity }: { activity: Activity }) {
  const name = activity.full_name || activity.username;
  const label = actionLabel[activity.action] || activity.action;

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
        {name[0]?.toUpperCase()}
      </div>
      <div>
        <p className="text-sm">
          <span className="font-medium">{name}</span>{" "}
          <span className="text-muted-foreground">{label}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(activity.created_at).toLocaleString("tr-TR")}
        </p>
      </div>
    </div>
  );
}

export default function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>();

  const { data: stats } = useQuery({
    queryKey: ["statistics", id],
    queryFn: () => getStatisticsApi(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: activities } = useQuery({
    queryKey: ["activities", id],
    queryFn: () => getActivitiesApi(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const statCards = [
    { label: "Toplam Görev", value: stats?.total_tasks ?? "—" },
    { label: "Yapılacak", value: stats?.todo_tasks ?? "—" },
    { label: "Devam Eden", value: stats?.in_progress_tasks ?? "—" },
    { label: "Tamamlanan", value: stats?.completed_tasks ?? "—" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Aktiviteler</h3>
        <Card>
          <CardContent className="pt-4">
            {!activities || activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Henüz aktivite yok
              </p>
            ) : (
              activities.map((a) => <ActivityItem key={a.id} activity={a} />)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}