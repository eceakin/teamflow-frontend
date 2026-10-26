# TeamFlow — Frontend

A Jira-style project management web app built with **React 19**, **TypeScript** and **Vite**. Teams can organise work into projects, track tasks on a Kanban board, plan sprints, discuss tasks in threaded comments and manage members with role-based permissions.

This is the client application. It talks to the [TeamFlow REST API](https://github.com/betlsari/TeamFlow_) (Node.js, Express, PostgreSQL).

---

## Features

**Authentication**
- Register and log in with JWT access and refresh tokens
- Silent token refresh: on a `401`, Axios refreshes the token once, queues parallel requests and retries them
- Protected routes that redirect to `/login`
- Profile editing (name, avatar URL) and password change

**Projects and tasks**
- Dashboard listing your projects, with create, update and delete
- Project overview with task counts by status
- **Kanban board** with drag-and-drop status changes (dnd-kit)
- **List view** with filters for status, assignee and sprint
- Task detail opens as a modal on top of the board, with its own shareable URL
- Assignees, labels, priority and due dates per task
- **Threaded comments** with replies, edit and delete
- **File attachments**: upload, list and delete

**Team and planning**
- **Sprints**: create, start and end sprints; add or remove tasks
- **Labels**: per-project labels with colours
- **Members**: add and remove members, with roles `owner`, `contributor` and `viewer`
- Role-based UI: actions are shown or hidden according to the user's role in the project

**Notifications**
- Notification dropdown and page, refreshed every 5 seconds
- Mark one or all as read, delete

## Tech stack

| Area | Library |
|---|---|
| Framework | React 19, TypeScript |
| Build tool | Vite |
| Routing | React Router 7 |
| Server state | TanStack Query 5 |
| Client state | Zustand (auth store) |
| Forms and validation | React Hook Form, Zod |
| HTTP | Axios with request/response interceptors |
| UI | Tailwind CSS, shadcn/ui (Radix), lucide-react, Sonner toasts |
| Drag and drop | dnd-kit |
| Testing | Vitest, Testing Library, MSW, jsdom |

## Getting started

### Prerequisites

- Node.js 18 or newer
- The [TeamFlow backend](https://github.com/betlsari/TeamFlow_) running, by default on `http://localhost:3000`

### Installation

```bash
git clone https://github.com/eceakin/teamflow-frontend.git
cd teamflow-frontend
npm install
```

### Configuration

The API base URL is read from `VITE_API_URL`. Create or edit `.env` in the project root:

```env
VITE_API_URL=http://localhost:3000/api
```

If the variable is not set, the app falls back to `http://localhost:3000/api`.

### Run

```bash
npm run dev       # start the dev server at http://localhost:5173
npm run build     # type-check and build for production into dist/
npm run preview   # preview the production build
npm run lint      # run ESLint
```

## Testing

```bash
npm run test       # Vitest in watch mode
npm run test:run   # single run (CI)
npm run test:ui    # Vitest UI
```

Tests run in jsdom and mock the API with **MSW**, so no backend is needed. They cover the auth store, the login and register pages and the `usePermission` hook.

## Project structure

```
src/
├── components/
│   ├── shared/              # Navbar, Sidebar, feedback components
│   ├── tasks/               # Kanban board, list view, task card, task detail modal,
│   │                        # filters, comments, attachments, assignees, labels
│   ├── ui/                  # shadcn/ui primitives
│   ├── ProjectLayout.tsx    # Layout for /projects/:id/*
│   ├── ProfileLayout.tsx    # Layout for /profile/*
│   └── NotificationDropdown.tsx
├── hooks/                   # React Query hooks: useTasks, useSprints,
│                            # useNotifications, usePermission
├── lib/
│   ├── axios.ts             # Axios instance and token refresh logic
│   ├── queryClient.ts       # TanStack Query client
│   └── api/                 # API functions per resource
├── pages/                   # Route pages (dashboard, board, sprints, members…)
├── routes/
│   └── ProtectedRoute.tsx
├── store/
│   └── authStore.ts         # Zustand auth store
├── test/                    # Test setup, MSW server and handlers
├── types/                   # Shared TypeScript types
├── AppRoutes.tsx            # Route definitions, including modal routing
└── main.tsx
```

## Routes

| Route | Page | Access |
|---|---|---|
| `/login`, `/register` | Login and registration | Public |
| `/dashboard` | Project list | Protected |
| `/notifications` | All notifications | Protected |
| `/projects/:id` | Project overview | Protected |
| `/projects/:id/board` | Kanban board | Protected |
| `/projects/:id/tasks` | Task list | Protected |
| `/projects/:id/tasks/:taskId` | Task detail (modal over the board) | Protected |
| `/projects/:id/sprints` | Sprint management | Protected |
| `/projects/:id/members` | Members and roles | Protected |
| `/projects/:id/labels` | Labels | Protected |
| `/projects/:id/settings` | Project settings | Protected |
| `/profile` | Profile | Protected |
| `/profile/password` | Change password | Protected |

## Authentication flow

1. After login or registration, the access token, refresh token and user are stored in the Zustand auth store.
2. A request interceptor adds `Authorization: Bearer <token>` to every request.
3. When a request returns `401`, the response interceptor calls `/auth/refresh` once. Requests that fail while the refresh is in progress wait in a queue and are retried with the new token.
4. If the refresh fails, or the user logs out or changes their password, the store is cleared and the user is sent to `/login`.

## License

This project was developed as a university assignment. All rights reserved.
