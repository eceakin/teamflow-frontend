import { Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProjectApi } from "@/lib/api/projects";
import Navbar from "@/components/shared/Navbar";
import ProjectSidebar from "@/components/shared/Sidebar"; // Yeni Sidebar entegre edildi

export default function ProjectLayout() {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectApi(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-white">
        Yükleniyor...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-white">
        Proje bulunamadı
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {" "}
      {/* Zemin Jira stili saf beyaz yapıldı */}
      <Navbar />
      {/* Proje Üst Bilgi Barı - Jira navigasyon hiyerarşisi */}
      <div className="border-b bg-white">
        <div className="px-6 h-12 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Projeler</span>
          <span>/</span>
          <span>{project.title}</span>
          <span>/</span>
          <span className="font-medium text-foreground">Kanban Board</span>
        </div>
      </div>
      <div className="flex">
        {/* Sol Menü (Sidebar) ve Dikey Ayırıcı Çizgi */}
        <aside className="border-r border-gray-200 min-h-[calc(100vh-7rem)] bg-white shrink-0">
          <div className="p-4 w-60">
            <ProjectSidebar />
          </div>
        </aside>

        {/* Ana İçerik Alanı (Kanban Board, List vb.) */}
        <main className="flex-1 overflow-hidden bg-white">
          <div className="p-8 max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
