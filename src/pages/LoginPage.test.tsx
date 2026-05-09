import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react"; // fireEvent ekle
import userEvent from "@testing-library/user-event";
import { render } from "@/test/utils";
import LoginPage from "@/pages/LoginPage";
import { useAuthStore } from "@/store/authStore";

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });
});

describe("LoginPage", () => {
  it("form alanları render edilmeli", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /giriş yap/i })).toBeInTheDocument();
  });

  it("boş form submit edilince validasyon hatası göstermeli", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.click(screen.getByRole("button", { name: /giriş yap/i }));
    expect(await screen.findByText(/e-posta zorunludur/i)).toBeInTheDocument();
    expect(await screen.findByText(/şifre zorunludur/i)).toBeInTheDocument();
  });

  it("geçersiz email formatında hata göstermeli", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByLabelText(/e-posta/i), "gecersiz-email");
    // HTML5 constraint validation'ı bypass edip doğrudan form'u submit et
    const form = screen.getByRole("button", { name: /giriş yap/i }).closest("form")!;
    fireEvent.submit(form);
    expect(await screen.findByText(/geçerli bir e-posta giriniz/i)).toBeInTheDocument();
  });

  // ... geri kalanlar aynı
  it("doğru bilgilerle giriş yapınca store güncellenmeli", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByLabelText(/e-posta/i), "test@example.com");
    await user.type(screen.getByLabelText(/şifre/i), "123456");
    await user.click(screen.getByRole("button", { name: /giriş yap/i }));

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe("mock-access-token");
      expect(state.user?.email).toBe("test@example.com");
    });
  });

  it("yanlış şifrede hata mesajı göstermeli", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByLabelText(/e-posta/i), "test@example.com");
    await user.type(screen.getByLabelText(/şifre/i), "yanlis-sifre");
    await user.click(screen.getByRole("button", { name: /giriş yap/i }));

    expect(await screen.findByText(/e-posta veya şifre hatalı/i)).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("kayıt ol linkini içermeli", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: /kayıt ol/i })).toHaveAttribute("href", "/register");
  });
});