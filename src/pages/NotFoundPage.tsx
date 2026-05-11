import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-sm">
        <p className="text-8xl font-bold text-muted-foreground/30">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Sayfa bulunamadı</h1>
          <p className="text-sm text-muted-foreground">
            Aradığın sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard">Ana sayfaya dön</Link>
        </Button>
      </div>
    </div>
  );
}