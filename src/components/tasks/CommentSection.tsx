import { useState } from "react";
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from "@/hooks/useTasks";
import type { Comment } from "@/types/task";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash2, CornerDownRight, Check, X } from "lucide-react";

// ─── Tek yorum ────────────────────────────────────────────────

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
  const [editContent, setEditContent] = useState(comment.content);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const { mutate: updateComment, isPending: isUpdating } =
    useUpdateComment(taskId);
  const { mutate: deleteComment } = useDeleteComment(taskId);
  const { mutate: createComment, isPending: isReplying } =
    useCreateComment(taskId);

  const handleUpdate = () => {
    if (!editContent.trim()) return;
    updateComment(
      { commentId: comment.id, content: editContent.trim() },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleReply = () => {
    if (!replyContent.trim()) return;
    createComment(
      { content: replyContent.trim(), parent_id: comment.id },
      {
        onSuccess: () => {
          setReplyContent("");
          setReplying(false);
        },
      },
    );
  };

  const name = comment.full_name || comment.username;

  return (
    <div className={depth > 0 ? "ml-8 border-l-2 border-border pl-3" : ""}>
      <div className="flex items-start gap-2.5 py-2 group">
        <Avatar size="sm" className="shrink-0 mt-0.5">
          <AvatarImage src={comment.avatar_url ?? undefined} />
          <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-1">
          {/* Başlık satırı */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.created_at).toLocaleString("tr-TR")}
            </span>

            {/* Eylemler */}
            <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {depth === 0 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setReplying(!replying)}
                  aria-label="Yanıtla"
                  title="Yanıtla"
                >
                  <CornerDownRight className="size-3" />
                </Button>
              )}
              {isMine && !editing && (
                <>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setEditContent(comment.content);
                      setEditing(true);
                    }}
                    aria-label="Düzenle"
                    title="Düzenle"
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteComment(comment.id)}
                    aria-label="Sil"
                    title="Sil"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* İçerik veya düzenleme formu */}
          {editing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={2}
                className="text-sm"
                autoFocus
              />
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUpdating || !editContent.trim()}
                  className="h-7 px-2 text-xs gap-1"
                >
                  <Check className="size-3" />
                  Kaydet
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(false)}
                  className="h-7 px-2 text-xs gap-1"
                >
                  <X className="size-3" />
                  İptal
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Yanıt formu */}
          {replying && (
            <div className="space-y-2 pt-1">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Yanıtınızı yazın..."
                rows={2}
                className="text-sm"
                autoFocus
              />
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={isReplying || !replyContent.trim()}
                  className="h-7 px-2 text-xs"
                >
                  Yanıtla
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplying(false);
                    setReplyContent("");
                  }}
                  className="h-7 px-2 text-xs"
                >
                  İptal
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alt yorumlar (replies) */}
      {comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          taskId={taskId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

// ─── CommentSection ───────────────────────────────────────────

interface CommentSectionProps {
  taskId: string;
}

export default function CommentSection({ taskId }: CommentSectionProps) {
  const [newContent, setNewContent] = useState("");
  const { data: comments = [], isLoading } = useComments(taskId);
  const { mutate: createComment, isPending } = useCreateComment(taskId);

  const handleSubmit = () => {
    if (!newContent.trim()) return;
    createComment(
      { content: newContent.trim() },
      { onSuccess: () => setNewContent("") },
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Yorumlar {comments.length > 0 && `(${comments.length})`}
      </p>

      {/* Yorum listesi */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henüz yorum yok.</p>
      ) : (
        <div className="space-y-0.5 divide-y divide-border/50">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} taskId={taskId} />
          ))}
        </div>
      )}

      {/* Yeni yorum formu */}
      <div className="space-y-2 pt-1">
        <Textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Yorum ekle..."
          rows={2}
          className="text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Ctrl+Enter ile gönder</p>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || !newContent.trim()}
            className="h-7 px-3 text-xs"
          >
            {isPending ? "Gönderiliyor..." : "Yorum Ekle"}
          </Button>
        </div>
      </div>
    </div>
  );
}
