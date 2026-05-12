import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── LoadingSpinner ───────────────────────────────────────────

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullPage?: boolean;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  fullPage = false,
  label = "Yükleniyor...",
}: LoadingSpinnerProps) {
  const sizeMap = { sm: 16, md: 24, lg: 40 };
  const px = sizeMap[size];

  const spinner = (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <svg
        className="animate-spin text-blue-600" // Jira kurumsal mavisi eklendi
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={px}
        height={px}
      >
        <circle
          className="opacity-10"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-100"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {size !== "sm" && (
        <span className="text-xs font-bold text-kanban-text uppercase tracking-widest">
          {label}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-[1px] z-[100] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// ─── EmptyState ───────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-lg border border-dashed border-kanban-border",
        className,
      )}
    >
      {icon && <div className="mb-4 text-kanban-text opacity-40">{icon}</div>}
      <p className="text-sm font-bold text-gray-800 uppercase tracking-tight mb-1">
        {title}
      </p>
      {description && (
        <p className="text-xs text-kanban-text max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ─── ErrorBoundary ────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError || !error) return children;

    if (fallback) return fallback(error, this.reset);

    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4 p-8 bg-white rounded-xl shadow-jira-card border border-kanban-border">
          <div className="flex justify-center text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">
              Bir hata oluştu
            </p>
            <p className="text-xs text-kanban-text mt-2 leading-relaxed">
              {error.message ||
                "Beklenmedik bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={this.reset}
            className="w-full border-kanban-border hover:bg-gray-50 text-xs font-bold uppercase tracking-widest"
          >
            Tekrar dene
          </Button>
        </div>
      </div>
    );
  }
}
