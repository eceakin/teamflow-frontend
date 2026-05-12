import { type TaskStatus } from "@/types/task";
import type { Member } from "@/types";
import { Search, X } from "lucide-react"; // İkonlar için

export interface SprintOption {
  id: string;
  name: string;
}

export interface KanbanFilters {
  status: TaskStatus | "";
  assignee_id: string;
  sprint_id: string;
  search?: string; // Arama filtresi eklendi
}

interface FilterBarProps {
  filters: KanbanFilters;
  onChange: (filters: KanbanFilters) => void;
  members?: Member[];
  sprints?: SprintOption[];
  view: "board" | "list";
  onViewChange: (v: "board" | "list") => void;
}

export default function FilterBar({
  filters,
  onChange,
  members = [],
  sprints = [],
  view,
  onViewChange,
}: FilterBarProps) {
  const set = (patch: Partial<KanbanFilters>) =>
    onChange({ ...filters, ...patch });

  const hasActiveFilter =
    filters.status !== "" ||
    filters.assignee_id !== "" ||
    filters.sprint_id !== "" ||
    (filters.search?.length ?? 0) > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 pb-6">
      {/* 1. Arama Kutusu (Flat Tasarım) */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          type="text"
          placeholder="Görevlerde ara..."
          value={filters.search || ""}
          onChange={(e) => set({ search: e.target.value })}
          className="h-9 w-64 pl-10 pr-4 bg-gray-100 hover:bg-gray-200 focus:bg-white border-2 border-transparent focus:border-blue-500 rounded-md text-sm transition-all outline-none"
        />
      </div>

      {/* 2. Kullanıcı Avatarları (Hızlı Filtreleme) */}
      <div className="flex items-center -space-x-2 overflow-hidden px-2 border-r border-gray-200 mr-2">
        {members.slice(0, 5).map((m) => (
          <button
            key={m.id}
            onClick={() =>
              set({ assignee_id: filters.assignee_id === m.id ? "" : m.id })
            }
            title={m.full_name || m.username}
            className={`size-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${
              filters.assignee_id === m.id
                ? "border-blue-600 z-10 scale-110"
                : "border-white"
            }`}
          >
            <div className="size-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 rounded-full">
              {m.username[0].toUpperCase()}
            </div>
          </button>
        ))}
      </div>

      {/* 3. Dropdown Filtreler (Jira Tarzı Gri Butonlar) */}
      <div className="flex items-center gap-2">
        {/* Durum Seçimi */}
        <select
          value={filters.status}
          onChange={(e) => set({ status: e.target.value as TaskStatus | "" })}
          className="h-9 px-3 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 outline-none cursor-pointer transition-colors border-none"
        >
          <option value="">Tüm Durumlar</option>
          <option value="todo">Yapılacak</option>
          <option value="in_progress">Devam Ediyor</option>
          <option value="done">Tamamlandı</option>
        </select>

        {/* Sprint Seçimi */}
        {sprints.length > 0 && (
          <select
            value={filters.sprint_id}
            onChange={(e) => set({ sprint_id: e.target.value })}
            className="h-9 px-3 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 outline-none cursor-pointer transition-colors border-none"
          >
            <option value="">Tüm Sprintler</option>
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 4. Filtreleri Sıfırla */}
      {hasActiveFilter && (
        <button
          onClick={() =>
            onChange({ status: "", assignee_id: "", sprint_id: "", search: "" })
          }
          className="flex items-center gap-1 h-9 px-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        >
          <X className="size-4" />
          Filtreleri Temizle
        </button>
      )}

      {/* 5. Görünüm Değiştirici (Sağa Yaslı) */}
      <div className="ml-auto flex items-center bg-gray-100 p-1 rounded-md">
        <button
          onClick={() => onViewChange("board")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
            view === "board"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Board
        </button>
        <button
          onClick={() => onViewChange("list")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
            view === "list"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          List
        </button>
      </div>
    </div>
  );
}
