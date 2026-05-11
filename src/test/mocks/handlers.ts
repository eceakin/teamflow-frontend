import { http, HttpResponse } from "msw";
import { taskHandlers } from "./taskHandlers";
import { notificationHandlers } from "./notificationsHandlers";

const BASE = "http://localhost:3000/api";

const authHandlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;

    if (body.email === "test@example.com" && body.password === "123456") {
      return HttpResponse.json({
        success: true,
        message: "Giriş başarılı",
        data: {
          user: {
            id: "user-uuid-1",
            username: "testuser",
            email: "test@example.com",
            full_name: "Test User",
            avatar_url: null,
            created_at: "2024-01-01T00:00:00Z",
          },
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        },
      });
    }

    return HttpResponse.json(
      { success: false, message: "E-posta veya şifre hatalı" },
      { status: 401 },
    );
  }),

  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;

    if (body.email === "existing@example.com") {
      return HttpResponse.json(
        {
          success: false,
          message: "Bu e-posta veya kullanıcı adı zaten kullanılıyor",
        },
        { status: 409 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: "Kayıt başarılı",
        data: {
          user: {
            id: "user-uuid-2",
            username: body.username,
            email: body.email,
            full_name: body.full_name || null,
            avatar_url: null,
            created_at: "2024-01-01T00:00:00Z",
          },
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        },
      },
      { status: 201 },
    );
  }),

  http.post(`${BASE}/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;

    if (body.refreshToken === "mock-refresh-token") {
      return HttpResponse.json({
        success: true,
        message: "Token yenilendi",
        data: { accessToken: "new-mock-access-token" },
      });
    }

    return HttpResponse.json(
      { success: false, message: "Geçersiz refresh token" },
      { status: 401 },
    );
  }),

  http.post(`${BASE}/auth/logout`, () =>
    HttpResponse.json({ success: true, message: "Çıkış başarılı", data: null }),
  ),

  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json({
      success: true,
      message: "İşlem başarılı",
      data: {
        id: "user-uuid-1",
        username: "testuser",
        email: "test@example.com",
        full_name: "Test User",
        avatar_url: null,
        created_at: "2024-01-01T00:00:00Z",
      },
    }),
  ),

  http.get(`${BASE}/projects/:id/members`, ({ params }) => {
    if (params.id === "project-owner") {
      return HttpResponse.json({
        success: true,
        message: "İşlem başarılı",
        data: [
          {
            id: "user-uuid-1",
            username: "testuser",
            full_name: "Test User",
            avatar_url: null,
            role: "owner",
            joined_at: "2024-01-01T00:00:00Z",
          },
        ],
      });
    }

    if (params.id === "project-contributor") {
      return HttpResponse.json({
        success: true,
        message: "İşlem başarılı",
        data: [
          {
            id: "user-uuid-1",
            username: "testuser",
            full_name: "Test User",
            avatar_url: null,
            role: "contributor",
            joined_at: "2024-01-01T00:00:00Z",
          },
        ],
      });
    }

    if (params.id === "project-viewer") {
      return HttpResponse.json({
        success: true,
        message: "İşlem başarılı",
        data: [
          {
            id: "user-uuid-1",
            username: "testuser",
            full_name: "Test User",
            avatar_url: null,
            role: "viewer",
            joined_at: "2024-01-01T00:00:00Z",
          },
        ],
      });
    }

    return HttpResponse.json({
      success: true,
      message: "İşlem başarılı",
      data: [],
    });
  }),
];

export const handlers = [...authHandlers, ...taskHandlers, ...notificationHandlers ];
