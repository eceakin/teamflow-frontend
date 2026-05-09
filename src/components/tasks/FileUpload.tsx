import { useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/axios";

// ─── Sabitler ─────────────────────────────────────────────────

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
];

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
  ".zip",
];

// ─── Dosya durumu tipi ────────────────────────────────────────

type FileStatus = "pending" | "uploading" | "success" | "error";

interface FileEntry {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  errorMessage?: string;
}

// ─── Dosya boyutu formatı ─────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ─── Validasyon ───────────────────────────────────────────────

function validateFile(file: File): string | null {
  if (file.size > MAX_SIZE_BYTES) {
    return `Dosya çok büyük (maks ${formatBytes(MAX_SIZE_BYTES)})`;
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Desteklenmeyen dosya türü";
  }
  return null;
}

// ─── İlerleme çubuğu ─────────────────────────────────────────

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ─── Tek dosya satırı ─────────────────────────────────────────

function FileRow({
  entry,
  onRemove,
}: {
  entry: FileEntry;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 py-2 px-3 rounded-lg bg-muted/40">
      <div className="flex items-center gap-2">
        {/* Durum ikonu */}
        {entry.status === "uploading" && (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
        )}
        {entry.status === "success" && (
          <CheckCircle2 className="size-3.5 shrink-0 text-green-500" />
        )}
        {entry.status === "error" && (
          <AlertCircle className="size-3.5 shrink-0 text-destructive" />
        )}
        {entry.status === "pending" && (
          <div className="size-3.5 shrink-0 rounded-full border-2 border-muted-foreground/40" />
        )}

        <span className="flex-1 text-xs font-medium truncate text-foreground">
          {entry.file.name}
        </span>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {formatBytes(entry.file.size)}
        </span>
        {entry.status !== "uploading" && (
          <button
            onClick={() => onRemove(entry.id)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Kaldır"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {entry.status === "uploading" && (
        <ProgressBar progress={entry.progress} />
      )}

      {entry.status === "error" && entry.errorMessage && (
        <p className="text-[10px] text-destructive">{entry.errorMessage}</p>
      )}
    </div>
  );
}

// ─── FileUpload ───────────────────────────────────────────────

interface FileUploadProps {
  taskId: string;
  onUploaded?: () => void;
}

export default function FileUpload({ taskId, onUploaded }: FileUploadProps) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [entries, setEntries] = useState<FileEntry[]>([]);

  // ─── Dosya ekleme ─────────────────────────────────────────

  const addFiles = useCallback((files: FileList | File[]) => {
    const newEntries: FileEntry[] = [];
    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      newEntries.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        status: error ? "error" : "pending",
        progress: 0,
        errorMessage: error ?? undefined,
      });
    });
    setEntries((prev) => [...prev, ...newEntries]);
  }, []);

  // ─── Drag & Drop ──────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Sadece zone'dan gerçekten çıkınca tetikle
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  // ─── Input change ─────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  // ─── Dosya kaldır ─────────────────────────────────────────

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // ─── Yükleme ──────────────────────────────────────────────

  const uploadAll = async () => {
    const pendingEntries = entries.filter((e) => e.status === "pending");
    if (pendingEntries.length === 0) return;

    for (const entry of pendingEntries) {
      // Durumu uploading yap
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id ? { ...e, status: "uploading", progress: 0 } : e,
        ),
      );

      const formData = new FormData();
      formData.append("file", entry.file);

      try {
        await api.post(`/tasks/${taskId}/attachments`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            const pct = event.total
              ? Math.round((event.loaded * 100) / event.total)
              : 0;
            setEntries((prev) =>
              prev.map((e) =>
                e.id === entry.id ? { ...e, progress: pct } : e,
              ),
            );
          },
        });

        setEntries((prev) =>
          prev.map((e) =>
            e.id === entry.id ? { ...e, status: "success", progress: 100 } : e,
          ),
        );

        qc.invalidateQueries({ queryKey: ["attachments", taskId] });
        onUploaded?.();
      } catch {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entry.id
              ? { ...e, status: "error", errorMessage: "Yükleme başarısız" }
              : e,
          ),
        );
      }
    }
  };

  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const isUploading = entries.some((e) => e.status === "uploading");

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed",
          "py-5 cursor-pointer transition-colors select-none",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-ring/50 hover:bg-muted/30",
        )}
      >
        <Upload
          className={cn(
            "size-5 transition-colors",
            isDragging ? "text-primary" : "text-muted-foreground",
          )}
        />
        <p className="text-xs text-muted-foreground text-center">
          <span className="font-medium text-foreground">Dosya seç</span> ya da
          buraya sürükle
        </p>
        <p className="text-[10px] text-muted-foreground">
          {ALLOWED_EXTENSIONS.join(", ")} · maks 10 MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_EXTENSIONS.join(",")}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Dosya listesi */}
      {entries.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
          {entries.map((entry) => (
            <FileRow key={entry.id} entry={entry} onRemove={removeEntry} />
          ))}
        </div>
      )}

      {/* Yükle butonu */}
      {pendingCount > 0 && (
        <Button
          size="sm"
          onClick={uploadAll}
          disabled={isUploading}
          className="w-full h-7 text-xs"
        >
          {isUploading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin" />
              Yükleniyor...
            </span>
          ) : (
            `${pendingCount} dosyayı yükle`
          )}
        </Button>
      )}
    </div>
  );
}
