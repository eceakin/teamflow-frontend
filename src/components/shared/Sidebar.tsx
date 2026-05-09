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
      <nav className="flex flex-col gap-0.5 sticky top-[4.5rem]">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
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
