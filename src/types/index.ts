export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "archived" | "completed";
  owner_id: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown[];
}


export interface Member {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "owner" | "contributor" | "viewer";
  joined_at: string;
}

export interface ProjectStatistics {
  total_tasks: string;
  completed_tasks: string;
  in_progress_tasks: string;
  todo_tasks: string;
}

export interface Activity {
  id: string;
  project_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  username: string;
  full_name: string | null;
}

export interface Label {
  id: string;
  project_id: string;
  name: string;
  color: string;
  created_at: string;
}