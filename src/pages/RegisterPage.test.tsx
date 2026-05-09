import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/utils";
import RegisterPage from "@/pages/RegisterPage";
import { useAuthStore } from "@/store/authStore";

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });
});

describe("RegisterPage", () => {
  it("tüm form alanları render edilmeli", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/kullanıcı adı/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^şifre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ad soyad/i)).toBeInTheDocument();
  });

  it("kısa kullanıcı adında hata göstermeli", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await user.type(screen.getByLabelText(/kullanıcı adı/i), "ab");
    await user.click(screen.getByRole("button", { name: /kayıt ol/i }));
    expect(await screen.findByText(/en az 3 karakter/i)).toBeInTheDocument();
  });

  it("geçersiz karakter içeren kullanıcı adında hata göstermeli", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await user.type(screen.getByLabelText(/kullanıcı adı/i), "test user!");
    await user.click(screen.getByRole("button", { name: /kayıt ol/i }));
    expect(await screen.findByText(/sadece harf, rakam ve _ içerebilir/i)).toBeInTheDocument();
  });

  it("6 karakterden kısa şifrede hata göstermeli", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await user.type(screen.getByLabelText(/^şifre/i), "123");
    await user.click(screen.getByRole("button", { name: /kayıt ol/i }));
    expect(await screen.findByText(/en az 6 karakter/i)).toBeInTheDocument();
  });

  it("başarılı kayıtta store güncellenmeli", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await user.type(screen.getByLabelText(/kullanıcı adı/i), "newuser");
    await user.type(screen.getByLabelText(/e-posta/i), "new@example.com");
    await user.type(screen.getByLabelText(/^şifre/i), "123456");
    await user.click(screen.getByRole("button", { name: /kayıt ol/i }));

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe("mock-access-token");
    });
  });

  it("mevcut email ile kayıtta hata göstermeli", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await user.type(screen.getByLabelText(/kullanıcı adı/i), "someone");
    await user.type(screen.getByLabelText(/e-posta/i), "existing@example.com");
    await user.type(screen.getByLabelText(/^şifre/i), "123456");
    await user.click(screen.getByRole("button", { name: /kayıt ol/i }));

    expect(
      await screen.findByText(/bu e-posta veya kullanıcı adı zaten kullanılıyor/i)
    ).toBeInTheDocument();
  });
});