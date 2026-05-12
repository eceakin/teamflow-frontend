import type { Task, TaskPriority, TaskStatus } from "@/types/task";
import { cn } from "@/lib/utils";

// ─── Yardımcı etiket haritaları ──────────────────────────────

const statusLabel: Record<TaskStatus, string> = {
  todo: "YAPILACAK",
  in_progress: "DEVAM EDİYOR",
  done: "TAMAMLANDI",
};

const statusClass: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-600 border-gray-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  done: "bg-green-50 text-green-700 border-green-200",
};

const priorityConfig: Record<
  TaskPriority,
  { label: string; color: string; dot: string }
> = {
  critical: { label: "Kritik", color: "text-red-600", dot: "bg-red-600" },
  high: { label: "Yüksek", color: "text-orange-600", dot: "bg-orange-600" },
  medium: { label: "Orta", color: "text-yellow-600", dot: "bg-yellow-600" },
  low: { label: "Düşük", color: "text-green-600", dot: "bg-green-600" },
};

function dueDateClass(dateStr: string | null): string {
  if (!dateStr) return "text-gray-400";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  if (due < today) return "text-red-600 font-semibold";
  const diff = (due.getTime() - today.getTime()) / 86_400_000;
  if (diff <= 2) return "text-orange-500 font-medium";
  return "text-gray-600";
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
      <div className="py-20 text-center bg-white rounded-lg border border-dashed border-gray-300">
        <p className="text-sm text-gray-500 font-medium">
          Henüz bir görev bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    /* Jira stili beyaz zemin ve temiz border yapısı */
    <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50">
            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-12 text-center">
              Tip
            </th>
            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Başlık
            </th>
            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell w-32">
              Durum
            </th>
            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell w-28">
              Öncelik
            </th>
            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
              Etiketler
            </th>
            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell w-28">
              Sorumlu
            </th>
            <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell w-32">
              Vade Tarihi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tasks.map((task) => {
            const labels = task.labels ?? [];
            const assignees = task.assignees ?? [];
            const priority = priorityConfig[task.priority];

            return (
              <tr
                key={task.id}
                onClick={() => onTaskClick?.(task)}
                className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
              >
                {/* Tip İkonu (Simüle edilmiş) */}
                <td className="px-4 py-4 text-center">
                  <div className="size-4 bg-blue-500 rounded-sm mx-auto flex items-center justify-center text-[8px] text-white font-bold">
                    S
                  </div>
                </td>

                {/* Başlık ve ID */}
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-normal text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {task.title}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">
                      TF-{task.id.slice(0, 4)}
                    </span>
                  </div>
                </td>

                {/* Durum Badge */}
                <td className="px-4 py-4 hidden sm:table-cell">
                  <span
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-sm border font-bold tracking-tight",
                      statusClass[task.status],
                    )}
                  >
                    {statusLabel[task.status]}
                  </span>
                </td>

                {/* Öncelik İkonlu Metin */}
                <td className="px-4 py-4 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <div className={cn("size-2 rounded-full", priority.dot)} />
                    <span className={cn("text-xs font-medium", priority.color)}>
                      {priority.label}
                    </span>
                  </div>
                </td>

                {/* Etiketler */}
                <td className="px-4 py-4 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1.5">
                    {labels.slice(0, 2).map((l) => (
                      <span
                        key={l.id}
                        className="text-[10px] px-2 py-0.5 rounded-sm font-semibold tracking-tight"
                        style={{
                          backgroundColor: l.color + "15",
                          color: l.color,
                        }}
                      >
                        {l.name}
                      </span>
                    ))}
                    {labels.length > 2 && (
                      <span className="text-[10px] text-gray-400 font-bold">
                        +{labels.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                {/* Sorumlu Avatarları */}
                <td className="px-4 py-4 hidden lg:table-cell">
                  <div className="flex -space-x-2">
                    {assignees.slice(0, 3).map((a) => (
                      <div key={a.id} className="relative group/avatar">
                        {a.avatar_url ? (
                          <img
                            src={a.avatar_url}
                            alt={a.username}
                            title={a.full_name || a.username}
                            className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                          />
                        ) : (
                          <div
                            title={a.full_name || a.username}
                            className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-600 ring-2 ring-white"
                          >
                            {(a.full_name || a.username)[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </td>

                {/* Vade Tarihi */}
                <td
                  className={cn(
                    "px-4 py-4 text-[12px] hidden lg:table-cell",
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
