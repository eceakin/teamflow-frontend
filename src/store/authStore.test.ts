import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/store/authStore";

const mockUser = {
  id: "user-uuid-1",
  username: "testuser",
  email: "test@example.com",
  full_name: "Test User",
  avatar_url: null,
  created_at: "2024-01-01T00:00:00Z",
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });
});

describe("authStore", () => {
  it("başlangıç state boş olmalı", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("login() state'i doğru doldurmalı", () => {
    useAuthStore.getState().login(mockUser, "access-token", "refresh-token");
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe("access-token");
    expect(state.refreshToken).toBe("refresh-token");
    expect(state.isAuthenticated).toBe(true);
  });

  it("logout() state'i temizlemeli", () => {
    useAuthStore.getState().login(mockUser, "access-token", "refresh-token");
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("setTokens() yalnızca token'ları güncellemeli", () => {
    useAuthStore.getState().login(mockUser, "old-access", "old-refresh");
    useAuthStore.getState().setTokens("new-access", "old-refresh");
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("new-access");
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("logout() sonrası access token backend'de hâlâ geçerli olabilir — store temizleme frontend sorumluluğu", () => {
    useAuthStore.getState().login(mockUser, "access-token", "refresh-token");
    useAuthStore.getState().logout();
    // Backend access token'ı revoke etmez, sadece refresh'i revoke eder.
    // Frontend store'dan temizlenmesi yeterli.
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});