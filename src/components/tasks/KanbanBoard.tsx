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
    <div className="flex flex-col min-w-[300px] w-80 shrink-0">
      {/* Kolon başlığı - Sadeleştirilmiş ve Jira stiline uygun */}
      <div className="flex items-center gap-2 mb-3 px-2">
        <h3 className="text-xs font-bold text-kanban-text uppercase tracking-wider">
          {label}{" "}
          <span className="ml-1 font-normal opacity-70">{tasks.length}</span>
        </h3>
      </div>

      {/* Kart listesi - Gri arka plan ve esnek yapı */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[500px] rounded-lg p-2 transition-colors duration-150",
          isOver ? "bg-gray-200" : "bg-kanban-column",
        )}
      >
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <DraggableCard
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="h-16 flex items-center justify-center border-2 border-dashed border-kanban-border rounded-lg mt-2">
            <p className="text-[11px] text-kanban-text/60 font-medium">
              Henüz görev yok
            </p>
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
      <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-180px)] items-start">
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

      <DragOverlay dropAnimation={null}>
        {activeTask && (
          <div className="rotate-3 shadow-2xl opacity-90 cursor-grabbing">
            <TaskCard task={activeTask} isDragging={false} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
