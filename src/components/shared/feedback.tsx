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
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <svg
        className="animate-spin text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={px}
        height={px}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {size !== "sm" && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
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
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className,
      )}
    >
      {icon && <div className="mb-4 text-muted-foreground/50">{icon}</div>}
      <p className="font-medium text-foreground mb-1">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
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
        <div className="max-w-sm w-full text-center space-y-4">
          {/* Alert icon — inline SVG */}
          <div className="flex justify-center text-destructive">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
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
            <p className="font-semibold text-foreground">
              Bir şeyler ters gitti
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {error.message || "Beklenmedik bir hata oluştu."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={this.reset}>
            Tekrar dene
          </Button>
        </div>
      </div>
    );
  }
}
