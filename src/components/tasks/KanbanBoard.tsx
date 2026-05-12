import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/types/task";
import TaskCard from "./TaskCard";
import { cn } from "@/lib/utils";

// ─── Kolon tanımları ──────────────────────────────────────────

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "Yapılacak", color: "bg-slate-500" },
  { id: "in_progress", label: "Devam Ediyor", color: "bg-blue-500" },
  { id: "done", label: "Tamamlandı", color: "bg-green-500" },
];

// ─── Droppable Kolon ──────────────────────────────────────────

function KanbanColumn({
  status,
  label,
  color,
  tasks,
  onTaskClick,
}: {
  status: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col min-w-[280px] w-full">
      {/* Kolon başlığı */}
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("w-2 h-2 rounded-full", color)} />
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Kart listesi */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[120px] rounded-xl p-2 space-y-2 transition-colors duration-150",
          isOver ? "bg-primary/5 ring-2 ring-primary/30" : "bg-muted/40",
        )}
      >
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} onTaskClick={onTaskClick} />
        ))}

        {tasks.length === 0 && (
          <div className="h-16 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Görev yok</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Draggable Kart ───────────────────────────────────────────

function DraggableCard({
  task,
  onTaskClick,
}: {
  task: Task;
  onTaskClick?: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  return (
    <div ref={setNodeRef}>
      <TaskCard
        task={task}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        onClick={onTaskClick}
      />
    </div>
  );
}

// ─── KanbanBoard ──────────────────────────────────────────────

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
}

export default function KanbanBoard({
  tasks,
  onStatusChange,
  onTaskClick,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  // tasks undefined geldiğinde çökmeyi engellemek için güvenlik eklendi
  const tasksByStatus = (status: TaskStatus) =>
    (tasks || []).filter((t) => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // tasks undefined geldiğinde çökmeyi engellemek için güvenlik eklendi
    const task = (tasks || []).find((t) => t.id === taskId);

    if (task && task.status !== newStatus) {
      onStatusChange(taskId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            status={col.id}
            label={col.label}
            color={col.color}
            tasks={tasksByStatus(col.id)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 shadow-2xl opacity-95">
            <TaskCard task={activeTask} isDragging={false} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
