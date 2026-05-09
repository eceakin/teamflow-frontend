import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAttachmentsApi } from "@/lib/api/tasks";
import { useAuthStore } from "@/store/authStore";
import type { Attachment } from "@/types/task";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Paperclip,
  Trash2,
  Download,
  FileText,
  Image,
  FileArchive,
  FileSpreadsheet,
} from "lucide-react";
import api from "@/lib/axios";

// ─── Dosya türüne göre ikon ───────────────────────────────────

function FileIcon({ fileName }: { fileName: string }) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const archiveExts = ["zip", "rar", "tar", "gz"];
  const spreadsheetExts = ["xlsx", "xls", "csv"];

  if (imageExts.includes(ext))
    return <Image className="size-4 text-blue-500" />;
  if (archiveExts.includes(ext))
    return <FileArchive className="size-4 text-yellow-500" />;
  if (spreadsheetExts.includes(ext))
    return <FileSpreadsheet className="size-4 text-green-500" />;
  return <FileText className="size-4 text-muted-foreground" />;
}

// ─── Zaman formatı ────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m}d önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}s önce`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}g önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Tek dosya satırı ─────────────────────────────────────────

function AttachmentItem({
  attachment,
  taskId,
  canDelete,
}: {
  attachment: Attachment;
  taskId: string;
  canDelete: boolean;
}) {
  const qc = useQueryClient();

  const { mutate: deleteAttachment, isPending } = useMutation({
    mutationFn: () => api.delete(`/attachments/${attachment.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attachments", taskId] });
    },
  });

  const handleDownload = () => {
    window.open(
      `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/attachments/${attachment.id}/download`,
      "_blank",
    );
  };

  return (
    <div className="group flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      <FileIcon fileName={attachment.file_name} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-foreground">
          {attachment.file_name}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {attachment.full_name || attachment.username} ·{" "}
          {timeAgo(attachment.created_at)}
        </p>
      </div>

      {/* Eylemler */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDownload}
          title="İndir"
          className="h-6 w-6"
        >
          <Download className="size-3" />
        </Button>

        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 text-destructive hover:text-destructive"
                title="Sil"
                disabled={isPending}
              >
                <Trash2 className="size-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Dosya silinsin mi?</AlertDialogTitle>
                <AlertDialogDescription>
                  <strong>{attachment.file_name}</strong> kalıcı olarak
                  silinecek.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteAttachment()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

// ─── AttachmentList ───────────────────────────────────────────

interface AttachmentListProps {
  taskId: string;
  /** Dosya silme yetkisi (owner veya yükleyen) */
  canEdit?: boolean;
}

export default function AttachmentList({
  taskId,
  canEdit = false,
}: AttachmentListProps) {
  const currentUser = useAuthStore((s) => s.user);

  const {
    data: attachments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["attachments", taskId],
    queryFn: () => getAttachmentsApi(taskId).then((r) => r.data.data),
    enabled: !!taskId,
  });

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        <Paperclip className="size-3" />
        Dosyalar{attachments.length > 0 ? ` (${attachments.length})` : ""}
      </p>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <span className="size-3.5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          Yükleniyor...
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive py-1">Dosyalar yüklenemedi.</p>
      )}

      {!isLoading && !isError && attachments.length === 0 && (
        <p className="text-sm text-muted-foreground py-1">Henüz dosya yok.</p>
      )}

      {!isLoading && !isError && attachments.length > 0 && (
        <div className="divide-y divide-border/40 -mx-3">
          {attachments.map((att: Attachment) => (
            <AttachmentItem
              key={att.id}
              attachment={att}
              taskId={taskId}
              // Silme: owner/contributor ya da dosyayı kendisi yüklediyse
              canDelete={canEdit || att.uploaded_by === currentUser?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
