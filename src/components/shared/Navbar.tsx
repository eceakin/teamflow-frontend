import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Bell, LogOut, LayoutGrid, ChevronDown } from "lucide-react";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/authStore";
import { logoutApi } from "@/lib/api/auth";

export default function Navbar() {
  const unReadCount = useUnreadCount();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logout = useAuthStore((s) => s.logout);

  const { mutate: handleLogout } = useMutation({
    mutationFn: () => logoutApi(refreshToken!),
    onSettled: () => {
      logout();
      navigate("/login");
    },
  });

  // Aktif sayfa kontrolü için yardımcı fonksiyon
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="h-14 border-b border-gray-200 bg-white sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1600px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Sol Taraf: Logo ve Navigasyon */}
        <div className="flex items-center gap-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 group shrink-0"
          >
            <div className="size-8 bg-blue-600 rounded-md flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <LayoutGrid className="size-5" />
            </div>
            <span className="font-black text-xl tracking-tighter text-gray-900 dark:text-white uppercase">
              TeamFlow
            </span>
          </Link>

          {/* Navigasyon Menüsü - Tıklama hatasını önlemek için doğrudan Link stilize edildi */}
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

            <Link
              to="/dashboard"
              className="text-sm font-semibold px-3 py-1.5 rounded-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              Filtreler <ChevronDown className="size-3 opacity-50" />
            </Link>

            <Link
              to="/dashboard"
              className="text-sm font-semibold px-3 py-1.5 rounded-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              Panolar <ChevronDown className="size-3 opacity-50" />
            </Link>
          </nav>
        </div>

        {/* Sağ Taraf: Aksiyonlar ve Profil */}
        <div className="flex items-center gap-3">
          {/* Bildirimler */}
          <Link
            to="/notifications"
            className={`relative p-2 rounded-full transition-colors ${
              isActive("/notifications")
                ? "text-blue-600 bg-blue-50"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Bell className="size-5" />
            {unReadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                {unReadCount > 9 ? "9+" : unReadCount}
              </span>
            )}
          </Link>

          {/* Profil ve Çıkış */}
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
