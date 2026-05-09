// taskHandlers.ts dosyasına eklenecek ek handler'lar
// Mevcut taskHandlers array'ine bu handler'ları ekleyin.
//
// Kullanım:
//   export const taskHandlers = [
//     ...mevcutHandlerlar,
//     ...attachmentHandlers,   // ← bunu ekle
//   ];

import { http, HttpResponse } from "msw";
import type { Attachment } from "@/types/task";

const BASE = "http://localhost:3000/api";

// In-memory attachment store (test ortamı için)
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

export const attachmentHandlers = [
  // GET /api/tasks/:id/attachments
  http.get(`${BASE}/tasks/:id/attachments`, ({ params }) => {
    const attachments = MOCK_ATTACHMENTS.filter((a) => a.task_id === params.id);
    return HttpResponse.json({
      success: true,
      message: "İşlem başarılı",
      data: attachments,
    });
  }),

  // POST /api/tasks/:id/attachments  (multipart/form-data)
  http.post(`${BASE}/tasks/:id/attachments`, async ({ params }) => {
    // MSW FormData okuma — gerçek dosya içeriği test ortamında mock'lanır
    const newAttachment: Attachment = {
      id: `attachment-uuid-${Date.now()}`,
      task_id: params.id as string,
      file_url: `/uploads/mock-file-${Date.now()}.pdf`,
      file_name: `mock-upload-${Date.now()}.pdf`,
      uploaded_by: "user-uuid-1",
      username: "testuser",
      full_name: "Test User",
      created_at: new Date().toISOString(),
    };
    MOCK_ATTACHMENTS.push(newAttachment);
    return HttpResponse.json(
      { success: true, message: "Dosya yüklendi", data: newAttachment },
      { status: 201 },
    );
  }),

  // DELETE /api/attachments/:id
  http.delete(`${BASE}/attachments/:id`, ({ params }) => {
    const idx = MOCK_ATTACHMENTS.findIndex((a) => a.id === params.id);
    if (idx !== -1) MOCK_ATTACHMENTS.splice(idx, 1);
    return HttpResponse.json({
      success: true,
      message: "Dosya silindi",
      data: null,
    });
  }),

  // GET /api/attachments/:id/download  (test ortamında redirect simüle et)
  http.get(`${BASE}/attachments/:id/download`, ({ params }) => {
    const attachment = MOCK_ATTACHMENTS.find((a) => a.id === params.id);
    if (!attachment) {
      return HttpResponse.json(
        { success: false, message: "Dosya bulunamadı" },
        { status: 404 },
      );
    }
    // Test ortamında gerçek dosya yerine 200 döndür
    return HttpResponse.json({
      success: true,
      message: "İndir",
      data: { url: attachment.file_url },
    });
  }),
];
