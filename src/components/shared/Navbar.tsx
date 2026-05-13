import { useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LogOut, LayoutGrid, ChevronDown } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/authStore";
import { logoutApi } from "@/lib/api/auth";
import NotificationDropdown from "../NotificationDropdown";
import { toast } from "sonner";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshToken, logout } = useAuthStore();

  const { data } = useNotifications(5);
  const lastNotificationId = useRef<string | null>(null);

  useEffect(() => {
    const latestNotify = data?.notifications?.[0];

    if (
      latestNotify &&
      !latestNotify.is_read &&
      latestNotify.id !== lastNotificationId.current
    ) {
      toast.info("Yeni Bildirim", {
        description: latestNotify.content,
        duration: 5000,
        action: {
          label: "Gör",
          onClick: () => navigate("/notifications"),
        },
        // Manuel kapatma butonu
        cancel: {
          label: "Kapat",
          onClick: () => console.log("Bildirim kapatıldı"),
        },
      });
      lastNotificationId.current = latestNotify.id;
    }
  }, [data, navigate]);

  const { mutate: handleLogout } = useMutation({
    mutationFn: () => logoutApi(refreshToken!),
    onSettled: () => {
      logout();
      navigate("/login");
    },
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="h-14 border-b border-gray-200 bg-white sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1600px] mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 group shrink-0"
          >
            <div className="size-8 bg-blue-600 rounded-md flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <LayoutGrid className="size-5" />
            </div>
            <span className="font-black text-xl tracking-tighter text-gray-900 uppercase">
              TeamFlow
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`text-sm font-semibold px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1 ${
                isActive("/dashboard")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              Projeler <ChevronDown className="size-3 opacity-50" />
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NotificationDropdown />

          <div className="flex items-center gap-1 ml-2 pl-3 border-l border-gray-200">
            <Link
              to="/profile"
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                isActive("/profile") ? "bg-blue-50" : "hover:bg-gray-100"
              }`}
            >
              <div className="size-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 border border-blue-200 shadow-sm">
                {user?.username?.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[11px] font-bold text-gray-900 leading-none">
                  {user?.username}
                </p>
                <p className="text-[9px] text-gray-500 font-medium">
                  Hesap Ayarları
                </p>
              </div>
            </Link>

            <button
              onClick={() => handleLogout()}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors ml-1"
              title="Çıkış yap"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
