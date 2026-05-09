import { NavLink, Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjectApi } from "@/lib/api/projects";
import { cn } from "@/lib/utils";
import Navbar from "@/components/shared/Navbar";

const tabs = [
  { label: "Genel Bakış", path: "" },
  { label: "Kanban Board", path: "board" },
  { label: "Görev Listesi", path: "tasks" },
  { label: "Sprintler", path: "sprints" }, // ← artık SprintsPage'e bağlı
  { label: "Üyeler", path: "members" },
  { label: "Etiketler", path: "labels" },
  { label: "Ayarlar", path: "settings" },
];

export default function ProjectLayout() {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectApi(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Yükleniyor...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Proje bulunamadı
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="border-b bg-background">
        <div className="max-w-6xl mx-auto px-4 h-10 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Projelerim</span>
          <span>/</span>
          <span className="font-semibold text-foreground">{project.title}</span>
        </div>
      </div>

      <div className="border-b overflow-x-auto">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={
                tab.path === ""
                  ? `/projects/${id}`
                  : `/projects/${id}/${tab.path}`
              }
              end={tab.path === ""}
              className={({ isActive }) =>
                cn(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
