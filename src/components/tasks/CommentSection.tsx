import { useState, useRef, useEffect } from "react";
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from "@/hooks/useTasks";
import type { Comment } from "@/types/task";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Pencil,
  Trash2,
  CornerDownRight,
  Check,
  X,
  MessageSquare,
} from "lucide-react";

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

// ─── Otomatik boyutlanan textarea ─────────────────────────────

function AutoTextarea({
  value,
  onChange,
  placeholder,
  autoFocus,
  onKeyDown,
  minRows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
      const len = ref.current.value.length;
      ref.current.setSelectionRange(len, len);
    }
  }, [autoFocus]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      rows={minRows}
      className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm
                 text-foreground placeholder:text-muted-foreground outline-none
                 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50
                 transition-colors overflow-hidden"
      style={{ minHeight: `${minRows * 1.5 + 1}rem` }}
    />
  );
}

// ─── Yorum formu ──────────────────────────────────────────────

interface CommentFormProps {
  initialValue?: string;
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  isPending?: boolean;
  autoFocus?: boolean;
  compact?: boolean;
}

function CommentForm({
  initialValue = "",
  placeholder = "Yorum ekle... (Ctrl+Enter ile gönder)",
  submitLabel = "Gönder",
  onSubmit,
  onCancel,
  isPending = false,
  autoFocus = false,
  compact = false,
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    if (!initialValue) setContent("");
  };

  return (
    <div className="space-y-2">
      <AutoTextarea
        value={content}
        onChange={setContent}
        placeholder={placeholder}
        autoFocus={autoFocus}
        minRows={compact ? 2 : 3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit();
          }
          if (e.key === "Escape" && onCancel) onCancel();
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">Ctrl+Enter</span>
        <div className="flex gap-1.5">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isPending}
              className="h-7 px-2.5 text-xs"
            >
              <X className="size-3 mr-1" />
              İptal
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || !content.trim()}
            className="h-7 px-2.5 text-xs"
          >
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <span className="size-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Gönderiliyor...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Check className="size-3" />
                {submitLabel}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Tek yorum öğesi (recursive) ─────────────────────────────

const MAX_DEPTH = 4;

function CommentItem({
  comment,
  taskId,
  depth = 0,
}: {
  comment: Comment;
  taskId: string;
  depth?: number;
}) {
  const currentUser = useAuthStore((s) => s.user);
  const isMine = currentUser?.id === comment.user_id;

  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const { mutate: updateComment, isPending: isUpdating } =
    useUpdateComment(taskId);
  const { mutate: deleteComment, isPending: isDeleting } =
    useDeleteComment(taskId);
  const { mutate: createComment, isPending: isReplying } =
    useCreateComment(taskId);

  const handleUpdate = (content: string) => {
    updateComment(
      { commentId: comment.id, content },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleReply = (content: string) => {
    createComment(
      { content, parent_id: comment.id },
      { onSuccess: () => setReplying(false) },
    );
  };

  const name = comment.full_name || comment.username;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={depth > 0 ? "ml-5" : ""}>
      <div className={depth > 0 ? "border-l-2 border-border/60 pl-3" : ""}>
        {/* Yorum gövdesi */}
        <div className="group flex gap-2.5 py-2">
          <Avatar size="sm" className="shrink-0 mt-0.5">
            <AvatarImage src={comment.avatar_url ?? undefined} />
            <AvatarFallback className="text-[10px]">
              {name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Meta satırı */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-1">
              <span className="text-xs font-semibold text-foreground">
                {name}
              </span>
              <span
                className="text-[11px] text-muted-foreground"
                title={new Date(comment.created_at).toLocaleString("tr-TR")}
              >
                {timeAgo(comment.created_at)}
              </span>

              {/* Eylemler */}
              <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {depth < MAX_DEPTH && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6"
                    title="Yanıtla"
                    onClick={() => {
                      setReplying((r) => !r);
                      setEditing(false);
                    }}
                  >
                    <CornerDownRight className="size-3" />
                  </Button>
                )}
                {isMine && !editing && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-6 w-6"
                      title="Düzenle"
                      onClick={() => {
                        setEditing(true);
                        setReplying(false);
                      }}
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          title="Sil"
                          disabled={isDeleting}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Yorum silinsin mi?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu yorum ve tüm alt yanıtları kalıcı olarak silinir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteComment(comment.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Evet, Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>

            {/* İçerik veya düzenleme formu */}
            {editing ? (
              <CommentForm
                initialValue={comment.content}
                submitLabel="Güncelle"
                onSubmit={handleUpdate}
                onCancel={() => setEditing(false)}
                isPending={isUpdating}
                autoFocus
                compact
              />
            ) : (
              <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                {comment.content}
              </p>
            )}

            {/* Yanıt formu */}
            {replying && (
              <div className="mt-2">
                <CommentForm
                  placeholder={`@${comment.username} kullanıcısına yanıt...`}
                  submitLabel="Yanıtla"
                  onSubmit={handleReply}
                  onCancel={() => setReplying(false)}
                  isPending={isReplying}
                  autoFocus
                  compact
                />
              </div>
            )}

            {/* Yanıtları aç/kapat */}
            {hasReplies && !editing && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="mt-1.5 text-[11px] text-primary/70 hover:text-primary transition-colors flex items-center gap-1"
              >
                <CornerDownRight className="size-2.5" />
                {showReplies
                  ? `${comment.replies.length} yanıtı gizle`
                  : `${comment.replies.length} yanıt göster`}
              </button>
            )}
          </div>
        </div>

        {/* Alt yorumlar (recursive) */}
        {hasReplies && showReplies && (
          <div>
            {comment.replies.map((reply: Comment) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                taskId={taskId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CommentSection ───────────────────────────────────────────

export default function CommentSection({ taskId }: { taskId: string }) {
  const { data: comments = [], isLoading, isError } = useComments(taskId);
  const { mutate: createComment, isPending } = useCreateComment(taskId);

  // Tüm ağaçtaki yorum sayısını hesapla
  const countAll = (list: Comment[]): number =>
    list.reduce(
      (acc: number, c: Comment) => acc + 1 + countAll(c.replies ?? []),
      0,
    );

  const total = countAll(comments);

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="flex items-center gap-2">
        <MessageSquare className="size-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Yorumlar{total > 0 ? ` (${total})` : ""}
        </span>
      </div>

      {/* Yükleniyor */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
          <span className="size-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          Yükleniyor...
        </div>
      )}

      {/* Hata */}
      {isError && (
        <p className="text-sm text-destructive py-2">Yorumlar yüklenemedi.</p>
      )}

      {/* Boş durum */}
      {!isLoading && !isError && comments.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">
          Henüz yorum yok. İlk yorumu sen ekle!
        </p>
      )}

      {/* Yorum ağacı */}
      {!isLoading && !isError && comments.length > 0 && (
        <div className="divide-y divide-border/40">
          {comments.map((c: Comment) => (
            <CommentItem key={c.id} comment={c} taskId={taskId} depth={0} />
          ))}
        </div>
      )}

      {/* Yeni yorum formu */}
      <div className="pt-3 border-t border-border">
        <CommentForm
          placeholder="Yorum ekle..."
          submitLabel="Yorum Ekle"
          onSubmit={(content) => createComment({ content })}
          isPending={isPending}
        />
      </div>
    </div>
  );
}
