import { type Task, type TaskPriority } from "@/types/task";
import { cn } from "@/lib/utils";

// ─── Öncelik Yapılandırması (Görseldeki ikonik renk tonları) ────────────────

const priorityConfig: Record<
  TaskPriority,
  { label: string; className: string; dotColor: string }
> = {
  critical: {
    label: "Kritik",
    className: "text-red-600 dark:text-red-400",
    dotColor: "bg-red-600",
  },
  high: {
    label: "Yüksek",
    className: "text-orange-600 dark:text-orange-400",
    dotColor: "bg-orange-600",
  },
  medium: {
    label: "Orta",
    className: "text-yellow-600 dark:text-yellow-400",
    dotColor: "bg-yellow-600",
  },
  low: {
    label: "Düşük",
    className: "text-green-600 dark:text-green-400",
    dotColor: "bg-green-600",
  },
};

// ─── Avatar Bileşeni ──────────────────────────────────────────

function AssigneeAvatar({
  username,
  avatarUrl,
}: {
  username: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        title={username}
        className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
      />
    );
  }
  return (
    <div
      title={username}
      className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-700 ring-2 ring-white dark:ring-gray-800"
    >
      {username[0]?.toUpperCase()}
    </div>
  );
}

// ─── Vade Tarihi Renk Mantığı ──────────────────────────────────

function dueDateClass(dateStr: string | null): string {
  if (!dateStr) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  if (due < today) return "text-red-600 dark:text-red-400";
  const diff = (due.getTime() - today.getTime()) / 86_400_000;
  if (diff <= 2) return "text-orange-500 dark:text-orange-400";
  return "text-muted-foreground";
}

// ─── TaskCard Ana Bileşen ──────────────────────────────────────

interface TaskCardProps {
  task: Task;
  /** Kartın tamamını sürüklenebilir yapar */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
  onClick?: (task: Task) => void;
}

export default function TaskCard({
  task,
  dragHandleProps,
  isDragging = false,
  onClick,
}: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const labels = task.labels ?? [];
  const assignees = task.assignees ?? [];

  return (
    <div
      className={cn(
        "group bg-white dark:bg-gray-800 rounded border border-kanban-border transition-all duration-200 select-none",
        isDragging
          ? "shadow-2xl rotate-2 opacity-90 border-blue-500 ring-2 ring-blue-500/20"
          : "shadow-jira-card hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-kanban-border",
      )}
      // Görseldeki gibi kartın her yerinden tutulabilmesi için props buraya eklendi
      {...dragHandleProps}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onClick?.(task)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick?.(task);
        }}
        className="p-3 space-y-3 cursor-pointer"
      >
        {/* Üst Kısım: Başlık */}
        <div>
          <p className="text-[13px] leading-snug font-normal text-gray-800 dark:text-gray-200 line-clamp-3">
            {task.title}
          </p>
        </div>

        {/* Orta Kısım: Etiketler (Labels) */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {labels.map((label) => (
              <span
                key={label.id}
                className="px-1.5 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-tight"
                style={{
                  backgroundColor: label.color + "22",
                  color: label.color,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Alt Satır: Öncelik, Vade ve Avatarlar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            {/* Öncelik Göstergesi */}
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", priority.dotColor)} />
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-tighter opacity-80",
                  priority.className,
                )}
              >
                {priority.label}
              </span>
            </div>

            {/* Vade Tarihi */}
            {task.due_date && (
              <span
                className={cn(
                  "text-[10px] font-medium",
                  dueDateClass(task.due_date),
                )}
              >
                {new Date(task.due_date).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </div>

          {/* Atanan Kişiler (Assignees) */}
          <div className="flex -space-x-1.5 items-center">
            {assignees.slice(0, 3).map((a) => (
              <AssigneeAvatar
                key={a.id}
                username={a.full_name || a.username}
                avatarUrl={a.avatar_url}
              />
            ))}
            {assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[9px] font-bold text-gray-500 ring-2 ring-white dark:ring-gray-800">
                +{assignees.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
