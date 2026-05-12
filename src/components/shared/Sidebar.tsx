import { NavLink, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Tag,
  Settings,
  Zap,
  KanbanSquare,
  List,
} from "lucide-react";

// ─── Dashboard sidebar (proje listesi sayfasında kullanılmaz,
//     proje içi sayfalar için kullanılır) ─────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  end?: boolean;
}

export default function ProjectSidebar() {
  const { id } = useParams<{ id: string }>();

  const items: NavItem[] = [
    {
      label: "Genel Bakış",
      path: `/projects/${id}`,
      icon: <LayoutDashboard className="size-4" />,
      end: true,
    },
    {
      label: "Kanban Board",
      path: `/projects/${id}/board`,
      icon: <KanbanSquare className="size-4" />,
    },
    {
      label: "Görev Listesi",
      path: `/projects/${id}/tasks`,
      icon: <List className="size-4" />,
    },
    {
      label: "Sprintler",
      path: `/projects/${id}/sprints`,
      icon: <Zap className="size-4" />,
    },
    {
      label: "Üyeler",
      path: `/projects/${id}/members`,
      icon: <Users className="size-4" />,
    },
    {
      label: "Etiketler",
      path: `/projects/${id}/labels`,
      icon: <Tag className="size-4" />,
    },
    {
      label: "Ayarlar",
      path: `/projects/${id}/settings`,
      icon: <Settings className="size-4" />,
    },
  ];

  return (
    <aside className="w-52 shrink-0 hidden md:block">
      <nav className="flex flex-col gap-1 sticky top-[4.5rem] pr-2">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-normal transition-colors border-l-4",
                isActive
                  ? "border-blue-600 text-blue-700 bg-blue-50/50 dark:text-blue-400 dark:border-blue-500 dark:bg-blue-900/20"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800/50",
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
