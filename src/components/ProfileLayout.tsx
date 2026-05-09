import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Profil", path: "/profile" },
  { label: "Şifre Değiştir", path: "/profile/password" },
];

export default function ProfileLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <h1 className="text-xl font-semibold">Hesap Ayarları</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 flex gap-8">
        <aside className="w-48 shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                end
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}