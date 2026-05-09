import { type Task, type TaskPriority } from "@/types/task";
import { cn } from "@/lib/utils";

// ─── Öncelik badge renkleri ───────────────────────────────────

const priorityConfig: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  critical: {
    label: "Kritik",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  high: {
    label: "Yüksek",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  medium: {
    label: "Orta",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  low: {
    label: "Düşük",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
};

// ─── Avatar ───────────────────────────────────────────────────

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
        className="w-6 h-6 rounded-full object-cover ring-2 ring-background"
      />
    );
  }
  return (
    <div
      title={username}
      className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground ring-2 ring-background"
    >
      {username[0]?.toUpperCase()}
    </div>
  );
}

// ─── Vade tarihi rengi ────────────────────────────────────────

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

// ─── TaskCard ─────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  /** Sürüklenebilir kart için dışarıdan gelen ref ve listener'lar */
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

  return (
    <div
      {...dragHandleProps}
      onClick={() => onClick?.(task)}
      className={cn(
        "group bg-card rounded-lg border border-border p-3 space-y-2.5",
        "cursor-pointer select-none",
        "hover:shadow-md hover:border-ring/40 transition-all duration-150",
        isDragging && "opacity-50 rotate-1 shadow-xl",
      )}
    >
      {/* Üst satır: öncelik + başlık */}
      <div className="space-y-1">
        <span
          className={cn(
            "inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded",
            priority.className,
          )}
        >
          {priority.label}
        </span>
        <p className="text-sm font-medium leading-snug line-clamp-2 text-foreground">
          {task.title}
        </p>
      </div>

      {/* Etiketler */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: label.color + "22",
                color: label.color,
                border: `1px solid ${label.color}44`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Alt satır: vade + avatarlar */}
      <div className="flex items-center justify-between pt-0.5">
        {/* Vade tarihi */}
        <span
          className={cn("text-[10px] font-medium", dueDateClass(task.due_date))}
        >
          {task.due_date
            ? new Date(task.due_date).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
              })
            : ""}
        </span>

        {/* Atanan avatarları */}
        {task.assignees.length > 0 && (
          <div className="flex -space-x-1.5">
            {task.assignees.slice(0, 3).map((a) => (
              <AssigneeAvatar
                key={a.id}
                username={a.full_name || a.username}
                avatarUrl={a.avatar_url}
              />
            ))}
            {task.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground ring-2 ring-background">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
