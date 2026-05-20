# MiniJira — Frontend

A Jira-inspired project management interface built with React, TypeScript, and Vite.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State Management:** Zustand (auth store)
- **Server State:** TanStack Query (React Query)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios (with interceptors for token refresh)
- **Testing:** Vitest + MSW (Mock Service Worker)
- **Font:** Geist Variable

## Features

- JWT authentication with silent token refresh via Axios interceptors
- Protected routes with automatic redirect to login
- Kanban board with drag-and-drop task status updates
- Task list view with multi-filter support (status, assignee, sprint)
- Sprint management UI: create, start, end sprints; assign tasks
- Nested comment threads on task detail modal
- File attachment upload/download per task
- Label management with color picker
- Project member management with role assignment
- Project overview with statistics and activity log
- Profile page with avatar upload and password change
- Dark mode support (Jira-style dark theme)
- Fully responsive layout

## Project Structure

```
src/
├── components/
│   ├── shared/              # Navbar, Sidebar, ErrorBoundary, LoadingSpinner
│   └── ui/                  # shadcn/ui primitives (Button, Card, Dialog…)
├── hooks/                   # Custom React Query hooks per resource
│   ├── useSprints.ts
│   ├── useTasks.ts
│   ├── useMembers.ts
│   └── usePermission.ts
├── lib/
│   ├── axios.ts             # Axios instance + refresh token interceptor
│   ├── queryClient.ts       # TanStack Query client config
│   └── api/                 # Per-resource API functions
│       ├── auth.ts
│       ├── projects.ts
│       ├── tasks.ts
│       ├── sprints.ts
│       └── labels.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── TasksBoardPage.tsx   # Kanban + list view
│   ├── SprintsPage.tsx
│   ├── MembersPage.tsx
│   ├── LabelsPage.tsx
│   ├── ProjectOverviewPage.tsx
│   ├── ProjectSettingsPage.tsx
│   ├── ProfilePage.tsx
│   ├── ChangePasswordPage.tsx
│   └── NotificationsPage.tsx
├── routes/
│   └── ProtectedRoute.tsx
├── store/
│   └── authStore.ts         # Zustand auth store
├── types/
│   ├── index.ts             # Project, Member, Activity types
│   └── task.ts              # Task, Comment, Attachment types
├── AppRoutes.tsx            # Route definitions + modal routing
└── main.tsx
```

## Pages & Routes

| Route | Page | Notes |
|-------|------|-------|
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/dashboard` | DashboardPage | Protected |
| `/projects/:id` | ProjectOverviewPage | Statistics & activity log |
| `/projects/:id/board` | TasksBoardPage | Kanban view |
| `/projects/:id/tasks` | TasksBoardPage | List view |
| `/projects/:id/tasks/:taskId` | TaskDetailModal | Rendered as overlay modal |
| `/projects/:id/sprints` | SprintsPage | Sprint lifecycle management |
| `/projects/:id/members` | MembersPage | Manage team roles |
| `/projects/:id/labels` | LabelsPage | Label CRUD |
| `/projects/:id/settings` | ProjectSettingsPage | Update or delete project |
| `/profile` | ProfilePage | Avatar + username update |
| `/profile/password` | ChangePasswordPage | Password change + logout |

## Getting Started

### Prerequisites

- Node.js 18+
- The [MiniJira Backend](../minijira-backend) running on `http://localhost:3000`

### Installation

```bash
git clone <repo-url>
cd minijira-frontend
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Run

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`.

### Testing

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui
```

Tests use **Vitest** for the test runner and **MSW** for API mocking. Auth store tests and task handler mocks are included.

## Auth Flow

1. On login, access token and refresh token are stored in Zustand.
2. Axios request interceptor attaches the access token to every request.
3. On 401 response, the response interceptor silently calls `/api/auth/refresh`, updates tokens in the store, and retries the original request.
4. On logout or password change, the store is cleared and the user is redirected to `/login`.

## License

MIT
