import type { Task, TaskPriority, TaskStatus } from "@/types/task";
import { cn } from "@/lib/utils";

// ─── Yardımcı etiket haritaları ──────────────────────────────

const statusLabel: Record<TaskStatus, string> = {
  todo: "Yapılacak",
  in_progress: "Devam Ediyor",
  done: "Tamamlandı",
};

const statusClass: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  in_progress:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  done: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const priorityLabel: Record<TaskPriority, string> = {
  critical: "Kritik",
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
};

const priorityClass: Record<TaskPriority, string> = {
  critical: "text-red-600 dark:text-red-400 font-semibold",
  high: "text-orange-600 dark:text-orange-400",
  medium: "text-yellow-600 dark:text-yellow-500",
  low: "text-green-600 dark:text-green-400",
};

function dueDateClass(dateStr: string | null): string {
  if (!dateStr) return "text-muted-foreground";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  if (due < today) return "text-red-600 dark:text-red-400 font-medium";
  const diff = (due.getTime() - today.getTime()) / 86_400_000;
  if (diff <= 2) return "text-orange-500 dark:text-orange-400";
  return "text-muted-foreground";
}

// ─── TaskListView ─────────────────────────────────────────────

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function TaskListView({
  tasks,
  onTaskClick,
}: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Görev bulunamadı.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">
              Görev
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">
              Durum
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">
              Öncelik
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">
              Etiketler
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
              Atananlar
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
              Vade
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.map((task) => {
            // DÜZELTME BURADA: Eğer veri undefined gelirse boş dizi kullanıyoruz
            const labels = task.labels ?? [];
            const assignees = task.assignees ?? [];

            return (
              <tr
                key={task.id}
                onClick={() => onTaskClick?.(task)}
                className="hover:bg-muted/30 cursor-pointer transition-colors"
              >
                {/* Başlık */}
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground line-clamp-1">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {task.description}
                    </p>
                  )}
                </td>

                {/* Durum */}
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      statusClass[task.status],
                    )}
                  >
                    {statusLabel[task.status]}
                  </span>
                </td>

                {/* Öncelik */}
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={cn("text-xs", priorityClass[task.priority])}>
                    {priorityLabel[task.priority]}
                  </span>
                </td>

                {/* Etiketler (Düzeltildi) */}
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {labels.slice(0, 2).map((l) => (
                      <span
                        key={l.id}
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: l.color + "22",
                          color: l.color,
                          border: `1px solid ${l.color}44`,
                        }}
                      >
                        {l.name}
                      </span>
                    ))}
                    {labels.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{labels.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                {/* Atananlar (Düzeltildi) */}
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex -space-x-1.5">
                    {assignees.slice(0, 3).map((a) =>
                      a.avatar_url ? (
                        <img
                          key={a.id}
                          src={a.avatar_url}
                          alt={a.username}
                          title={a.full_name || a.username}
                          className="w-6 h-6 rounded-full object-cover ring-2 ring-background"
                        />
                      ) : (
                        <div
                          key={a.id}
                          title={a.full_name || a.username}
                          className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground ring-2 ring-background"
                        >
                          {(a.full_name || a.username)[0]?.toUpperCase()}
                        </div>
                      ),
                    )}
                  </div>
                </td>

                {/* Vade tarihi */}
                <td
                  className={cn(
                    "px-4 py-3 text-xs hidden lg:table-cell",
                    dueDateClass(task.due_date),
                  )}
                >
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
