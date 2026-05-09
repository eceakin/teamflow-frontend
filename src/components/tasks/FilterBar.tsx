import { type TaskStatus } from "@/types/task";
import type { Member } from "@/types";

export interface KanbanFilters {
  status: TaskStatus | "";
  assignee_id: string;
  sprint_id: string;
}

interface FilterBarProps {
  filters: KanbanFilters;
  onChange: (filters: KanbanFilters) => void;
  members?: Member[];
  /** Görünüm seçimi: board veya list */
  view: "board" | "list";
  onViewChange: (v: "board" | "list") => void;
}

export default function FilterBar({
  filters,
  onChange,
  members = [],
  view,
  onViewChange,
}: FilterBarProps) {
  const set = (patch: Partial<KanbanFilters>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-2 pb-4">
      {/* Durum filtresi */}
      <select
        value={filters.status}
        onChange={(e) => set({ status: e.target.value as TaskStatus | "" })}
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <option value="">Tüm Durumlar</option>
        <option value="todo">Yapılacak</option>
        <option value="in_progress">Devam Ediyor</option>
        <option value="done">Tamamlandı</option>
      </select>

      {/* Atanan filtresi */}
      {members.length > 0 && (
        <select
          value={filters.assignee_id}
          onChange={(e) => set({ assignee_id: e.target.value })}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="">Tüm Üyeler</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name || m.username}
            </option>
          ))}
        </select>
      )}

      {/* Sıfırla */}
      {(filters.status || filters.assignee_id || filters.sprint_id) && (
        <button
          onClick={() =>
            onChange({ status: "", assignee_id: "", sprint_id: "" })
          }
          className="h-8 px-3 text-sm text-muted-foreground hover:text-foreground border border-input rounded-lg transition-colors"
        >
          Filtreleri Temizle
        </button>
      )}

      {/* Görünüm toggle — sağa it */}
      <div className="ml-auto flex items-center gap-1 border border-input rounded-lg p-0.5">
        <button
          onClick={() => onViewChange("board")}
          title="Kanban Board"
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            view === "board"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {/* Board icon */}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="1" width="4" height="14" rx="1" />
            <rect x="6" y="1" width="4" height="10" rx="1" />
            <rect x="11" y="1" width="4" height="12" rx="1" />
          </svg>
        </button>
        <button
          onClick={() => onViewChange("list")}
          title="Liste Görünümü"
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            view === "list"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {/* List icon */}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="2" width="14" height="2" rx="1" />
            <rect x="1" y="7" width="14" height="2" rx="1" />
            <rect x="1" y="12" width="14" height="2" rx="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
