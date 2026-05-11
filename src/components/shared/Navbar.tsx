import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Bell, LogOut, User } from "lucide-react";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/authStore";
import { logoutApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";


export default function Navbar() {
  const unReadCount = useUnreadCount();
  const navigate = useNavigate();
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

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="font-semibold text-base tracking-tight hover:text-primary transition-colors"
        >
          TeamFlow
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative"
            aria-label="Bildirimler"
          >
            <Link to="/notifications">
              <Bell className="size-4" />
              {unReadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-0.5">
                  {unReadCount > 99 ? "99+" : unReadCount}
                </span>
              )}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild aria-label="Profil">
            <Link to="/profile">
              <User className="size-4" />
            </Link>
          </Button>

          <span className="text-sm text-muted-foreground px-2 hidden sm:block">
            {user?.username}
          </span>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Çıkış yap"
            onClick={() => handleLogout()}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
