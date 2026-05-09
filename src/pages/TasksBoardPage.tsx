import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTasks, useUpdateTaskStatus } from "@/hooks/useTasks";
import { useSprints } from "@/hooks/useSprints";
import { useQuery } from "@tanstack/react-query";
import { getMembersApi } from "@/lib/api/projects";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import TaskListView from "@/components/tasks/TaskListView";
import FilterBar, { type KanbanFilters } from "@/components/tasks/FilterBar";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { LoadingSpinner, EmptyState } from "@/components/shared/feedback";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus } from "@/types/task";
import { Plus, LayoutGrid } from "lucide-react";

export default function TasksBoardPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState<KanbanFilters>({
    status: "",
    assignee_id: "",
    sprint_id: "",
  });
  const [view, setView] = useState<"board" | "list">("board");
  const [createOpen, setCreateOpen] = useState(false);

  const taskFilters = {
    status: filters.status || undefined,
    assignee_id: filters.assignee_id || undefined,
    sprint_id: filters.sprint_id || undefined,
  };

  const { data: tasks = [], isLoading } = useTasks(projectId!, taskFilters);

  const { data: members = [] } = useQuery({
    queryKey: ["members", projectId],
    queryFn: () => getMembersApi(projectId!).then((r) => r.data.data),
    enabled: !!projectId,
  });

  // Sprint listesi — FilterBar'daki sprint filtresi için
  const { data: sprints = [] } = useSprints(projectId!);
  const sprintOptions = sprints.map((s) => ({ id: s.id, name: s.name }));

  const { mutate: updateStatus } = useUpdateTaskStatus(projectId!);

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateStatus({ taskId, status });
  };

  const handleTaskClick = (task: Task) => {
    navigate(`/projects/${projectId}/tasks/${task.id}`, {
      state: { backgroundLocation: location },
    });
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <LayoutGrid className="size-5" />
          Görev Panosu
        </h2>
        <Button
          onClick={() => setCreateOpen(true)}
          size="sm"
          className="gap-1.5"
        >
          <Plus className="size-4" />
          Görev Ekle
        </Button>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        members={members}
        sprints={sprintOptions} // ← artık dolu geliyor
        view={view}
        onViewChange={setView}
      />

      {tasks.length === 0 ? (
        <EmptyState
          title="Görev bulunamadı"
          description={
            filters.status || filters.assignee_id || filters.sprint_id
              ? "Filtreleri temizleyerek tüm görevleri görebilirsin."
              : "İlk görevi oluşturmak için Görev Ekle butonuna tıkla."
          }
          action={
            !filters.status && !filters.assignee_id && !filters.sprint_id ? (
              <Button onClick={() => setCreateOpen(true)} size="sm">
                <Plus className="size-4 mr-1.5" />
                Görev Ekle
              </Button>
            ) : undefined
          }
        />
      ) : view === "board" ? (
        <KanbanBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onTaskClick={handleTaskClick}
        />
      ) : (
        <TaskListView tasks={tasks} onTaskClick={handleTaskClick} />
      )}

      <CreateTaskModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId!}
      />
    </div>
  );
}
