import { http, HttpResponse } from "msw";
import type { Task, Comment, Attachment } from "@/types/task";

const BASE = "http://localhost:3000/api";

// ─── Seed verisi ──────────────────────────────────────────────

const MOCK_TASKS: Task[] = [
  {
    id: "task-uuid-1",
    project_id: "project-owner",
    sprint_id: null,
    title: "Login sayfası tasarımı",
    description: "E-posta + şifre formu, validasyon, hata mesajları",
    status: "done",
    priority: "high",
    due_date: "2026-05-21",
    created_by: "user-uuid-1",
    assignees: [
      {
        id: "user-uuid-1",
        username: "testuser",
        full_name: "Test User",
        avatar_url: null,
      },
    ],
    labels: [{ id: "label-uuid-1", name: "Frontend", color: "#6366F1" }],
    created_at: "2026-05-01T10:00:00Z",
  },
  {
    id: "task-uuid-2",
    project_id: "project-owner",
    sprint_id: null,
    title: "API entegrasyonu",
    description: "Axios interceptor + refresh token akışı",
    status: "in_progress",
    priority: "critical",
    due_date: null,
    created_by: "user-uuid-1",
    assignees: [],
    labels: [{ id: "label-uuid-2", name: "Backend", color: "#F59E0B" }],
    created_at: "2026-05-02T09:00:00Z",
  },
  {
    id: "task-uuid-3",
    project_id: "project-owner",
    sprint_id: null,
    title: "Birim testleri yaz",
    description: null,
    status: "todo",
    priority: "medium",
    due_date: "2026-05-28",
    created_by: "user-uuid-1",
    assignees: [],
    labels: [],
    created_at: "2026-05-03T08:00:00Z",
  },
];

const MOCK_COMMENTS: Comment[] = [
  {
    id: "comment-uuid-1",
    task_id: "task-uuid-1",
    user_id: "user-uuid-1",
    parent_id: null,
    content: "Bu görevi tamamladım, review bekliyor.",
    username: "testuser",
    full_name: "Test User",
    avatar_url: null,
    replies: [
      {
        id: "comment-uuid-2",
        task_id: "task-uuid-1",
        user_id: "user-uuid-1",
        parent_id: "comment-uuid-1",
        content: "Harika, kontrol ediyorum!",
        username: "testuser",
        full_name: "Test User",
        avatar_url: null,
        replies: [],
        created_at: "2026-05-05T11:30:00Z",
      },
    ],
    created_at: "2026-05-05T10:00:00Z",
  },
];

const MOCK_ATTACHMENTS: Attachment[] = [
  {
    id: "attachment-uuid-1",
    task_id: "task-uuid-1",
    file_url: "/uploads/mock-design.pdf",
    file_name: "login-design.pdf",
    uploaded_by: "user-uuid-1",
    username: "testuser",
    full_name: "Test User",
    created_at: "2026-05-04T12:00:00Z",
  },
];

// ─── Handler'lar ──────────────────────────────────────────────

export const taskHandlers = [
  // GET /api/projects/:id/tasks
  http.get(`${BASE}/projects/:id/tasks`, ({ params }) => {
    const tasks = MOCK_TASKS.filter((t) => t.project_id === params.id);
    return HttpResponse.json({
      success: true,
      message: "İşlem başarılı",
      data: tasks,
    });
  }),

  // POST /api/projects/:id/tasks
  http.post(`${BASE}/projects/:id/tasks`, async ({ request, params }) => {
    const body = (await request.json()) as Partial<Task>;
    const newTask: Task = {
      id: `task-uuid-${Date.now()}`,
      project_id: params.id as string,
      sprint_id: body.sprint_id ?? null,
      title: body.title ?? "Yeni görev",
      description: body.description ?? null,
      status: body.status ?? "todo",
      priority: body.priority ?? "medium",
      due_date: body.due_date ?? null,
      created_by: "user-uuid-1",
      assignees: [],
      labels: [],
      created_at: new Date().toISOString(),
    };
    MOCK_TASKS.push(newTask);
    return HttpResponse.json(
      { success: true, message: "Görev oluşturuldu", data: newTask },
      { status: 201 },
    );
  }),

  // GET /api/tasks/:id
  http.get(`${BASE}/tasks/:id`, ({ params }) => {
    const task = MOCK_TASKS.find((t) => t.id === params.id);
    if (!task) {
      return HttpResponse.json(
        { success: false, message: "Görev bulunamadı" },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      success: true,
      message: "İşlem başarılı",
      data: task,
    });
  }),

  // PUT /api/tasks/:id
  http.put(`${BASE}/tasks/:id`, async ({ request, params }) => {
    const body = (await request.json()) as Partial<Task>;
    const idx = MOCK_TASKS.findIndex((t) => t.id === params.id);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: "Görev bulunamadı" },
        { status: 404 },
      );
    }
    MOCK_TASKS[idx] = { ...MOCK_TASKS[idx], ...body };
    return HttpResponse.json({
      success: true,
      message: "Görev güncellendi",
      data: MOCK_TASKS[idx],
    });
  }),

  // PATCH /api/tasks/:id/status
  http.patch(`${BASE}/tasks/:id/status`, async ({ request, params }) => {
    const body = (await request.json()) as { status: Task["status"] };
    const idx = MOCK_TASKS.findIndex((t) => t.id === params.id);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: "Görev bulunamadı" },
        { status: 404 },
      );
    }
    MOCK_TASKS[idx].status = body.status;
    return HttpResponse.json({
      success: true,
      message: "Durum güncellendi",
      data: MOCK_TASKS[idx],
    });
  }),

  // DELETE /api/tasks/:id
  http.delete(`${BASE}/tasks/:id`, ({ params }) => {
    const idx = MOCK_TASKS.findIndex((t) => t.id === params.id);
    if (idx !== -1) MOCK_TASKS.splice(idx, 1);
    return HttpResponse.json({
      success: true,
      message: "Görev silindi",
      data: null,
    });
  }),

  // GET /api/tasks/:id/comments
  http.get(`${BASE}/tasks/:id/comments`, ({ params }) => {
    const comments = MOCK_COMMENTS.filter((c) => c.task_id === params.id);
    return HttpResponse.json({
      success: true,
      message: "İşlem başarılı",
      data: comments,
    });
  }),

  // POST /api/tasks/:id/comments
  http.post(`${BASE}/tasks/:id/comments`, async ({ request, params }) => {
    const body = (await request.json()) as {
      content: string;
      parent_id?: string;
    };
    const newComment: Comment = {
      id: `comment-uuid-${Date.now()}`,
      task_id: params.id as string,
      user_id: "user-uuid-1",
      parent_id: body.parent_id ?? null,
      content: body.content,
      username: "testuser",
      full_name: "Test User",
      avatar_url: null,
      replies: [],
      created_at: new Date().toISOString(),
    };
    MOCK_COMMENTS.push(newComment);
    return HttpResponse.json(
      { success: true, message: "Yorum eklendi", data: newComment },
      { status: 201 },
    );
  }),

  // PUT /api/comments/:id  ← EKSİKTİ
  http.put(`${BASE}/comments/:id`, async ({ request, params }) => {
    const body = (await request.json()) as { content: string };
    const idx = MOCK_COMMENTS.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: "Yorum bulunamadı" },
        { status: 404 },
      );
    }
    MOCK_COMMENTS[idx] = { ...MOCK_COMMENTS[idx], content: body.content };
    return HttpResponse.json({
      success: true,
      message: "Yorum güncellendi",
      data: MOCK_COMMENTS[idx],
    });
  }),

  // DELETE /api/comments/:id  ← EKSİKTİ
  http.delete(`${BASE}/comments/:id`, ({ params }) => {
    const idx = MOCK_COMMENTS.findIndex((c) => c.id === params.id);
    if (idx !== -1) MOCK_COMMENTS.splice(idx, 1);
    return HttpResponse.json({
      success: true,
      message: "Yorum silindi",
      data: null,
    });
  }),

  // GET /api/tasks/:id/attachments
  http.get(`${BASE}/tasks/:id/attachments`, ({ params }) => {
    const attachments = MOCK_ATTACHMENTS.filter((a) => a.task_id === params.id);
    return HttpResponse.json({
      success: true,
      message: "İşlem başarılı",
      data: attachments,
    });
  }),

  // POST /api/tasks/:id/assignees
  http.post(`${BASE}/tasks/:id/assignees`, async ({ request, params }) => {
    const body = (await request.json()) as { user_id: string };
    const task = MOCK_TASKS.find((t) => t.id === params.id);
    if (!task) {
      return HttpResponse.json(
        { success: false, message: "Görev bulunamadı" },
        { status: 404 },
      );
    }
    const alreadyAssigned = task.assignees.some((a) => a.id === body.user_id);
    if (!alreadyAssigned) {
      task.assignees.push({
        id: body.user_id,
        username: "testuser",
        full_name: "Test User",
        avatar_url: null,
      });
    }
    return HttpResponse.json(
      { success: true, message: "Atama yapıldı", data: null },
      { status: 201 },
    );
  }),

  // DELETE /api/tasks/:id/assignees/:userId
  http.delete(`${BASE}/tasks/:id/assignees/:userId`, ({ params }) => {
    const task = MOCK_TASKS.find((t) => t.id === params.id);
    if (task) {
      task.assignees = task.assignees.filter((a) => a.id !== params.userId);
    }
    return HttpResponse.json({
      success: true,
      message: "Atama kaldırıldı",
      data: null,
    });
  }),

  // POST /api/tasks/:id/labels
  http.post(`${BASE}/tasks/:id/labels`, async ({ request, params }) => {
    const body = (await request.json()) as { label_id: string };
    const task = MOCK_TASKS.find((t) => t.id === params.id);
    if (!task) {
      return HttpResponse.json(
        { success: false, message: "Görev bulunamadı" },
        { status: 404 },
      );
    }
    const alreadyHas = task.labels.some((l) => l.id === body.label_id);
    if (!alreadyHas) {
      task.labels.push({
        id: body.label_id,
        name: "Mock Label",
        color: "#6B7280",
      });
    }
    return HttpResponse.json(
      { success: true, message: "Etiket eklendi", data: null },
      { status: 201 },
    );
  }),

  // DELETE /api/tasks/:id/labels/:labelId
  http.delete(`${BASE}/tasks/:id/labels/:labelId`, ({ params }) => {
    const task = MOCK_TASKS.find((t) => t.id === params.id);
    if (task) {
      task.labels = task.labels.filter((l) => l.id !== params.labelId);
    }
    return HttpResponse.json({
      success: true,
      message: "Etiket kaldırıldı",
      data: null,
    });
  }),
];
