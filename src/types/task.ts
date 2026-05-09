// ─── Task ────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface TaskAssignee {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  project_id: string;
  sprint_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null; // ISO date string "2026-05-21"
  created_by: string;
  assignees: TaskAssignee[];
  labels: TaskLabel[];
  created_at: string;
}

// ─── Comment ─────────────────────────────────────────────────

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  replies: Comment[]; // nested tree — backend düzleştirilmişi ağaca çevirir
  created_at: string;
}

// ─── Attachment ──────────────────────────────────────────────

export interface Attachment {
  id: string;
  task_id: string;
  file_url: string;
  file_name: string;
  uploaded_by: string;
  username: string;
  full_name: string | null;
  created_at: string;
}
