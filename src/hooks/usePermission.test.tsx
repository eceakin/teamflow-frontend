import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";
import { useAuthStore } from "@/store/authStore";

const mockUser = {
  id: "user-uuid-1",
  username: "testuser",
  email: "test@example.com",
  full_name: "Test User",
  avatar_url: null,
  created_at: "2024-01-01T00:00:00Z",
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

beforeEach(() => {
  useAuthStore.setState({
    user: mockUser,
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    isAuthenticated: true,
  });
});

describe("usePermission — owner rolü", () => {
  it("canEdit() true döndürmeli", async () => {
    const { result } = renderHook(() => usePermission("project-owner"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canEdit()).toBe(true);
  });

  it("canDelete() true döndürmeli", async () => {
    const { result } = renderHook(() => usePermission("project-owner"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canDelete()).toBe(true);
  });

  it("canManageMembers() true döndürmeli", async () => {
    const { result } = renderHook(() => usePermission("project-owner"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canManageMembers()).toBe(true);
  });

  it("role 'owner' olmalı", async () => {
    const { result } = renderHook(() => usePermission("project-owner"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.role).toBe("owner");
  });
});

describe("usePermission — contributor rolü", () => {
  it("canEdit() true döndürmeli", async () => {
    const { result } = renderHook(() => usePermission("project-contributor"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canEdit()).toBe(true);
  });

  it("canDelete() false döndürmeli", async () => {
    const { result } = renderHook(() => usePermission("project-contributor"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canDelete()).toBe(false);
  });

  it("canManageMembers() false döndürmeli", async () => {
    const { result } = renderHook(() => usePermission("project-contributor"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canManageMembers()).toBe(false);
  });
});

describe("usePermission — viewer rolü", () => {
  it("canEdit() false döndürmeli", async () => {
    const { result } = renderHook(() => usePermission("project-viewer"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canEdit()).toBe(false);
  });

  it("canDelete() false döndürmeli", async () => {
    const { result } = renderHook(() => usePermission("project-viewer"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canDelete()).toBe(false);
  });

  it("canManageMembers() false döndürmeli", async () => {
    const { result } = renderHook(() => usePermission("project-viewer"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canManageMembers()).toBe(false);
  });
});

describe("usePermission — üye değil", () => {
  it("role null olmalı, tüm izinler false döndürmeli", async () => {
    const { result } = renderHook(() => usePermission("project-no-member"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.role).toBeNull();
    expect(result.current.canEdit()).toBe(false);
    expect(result.current.canDelete()).toBe(false);
    expect(result.current.canManageMembers()).toBe(false);
  });
});