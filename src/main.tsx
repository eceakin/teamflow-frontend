import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import TasksBoardPage from "@/pages/TasksBoardPage";
import TaskDetailModal from "@/components/tasks/TaskDetailModal";

import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import ProtectedRoute from "@/routes/ProtectedRoute";
import "@/index.css";
import ProjectLayout from "@/components/ProjectLayout";
import ProjectOverviewPage from "@/pages/ProjectOverviewPage";
import ProjectSettingsPage from "@/pages/ProjectSettingsPage";
import MembersPage from "@/pages/MembersPage";
import LabelsPage from "@/pages/LabelsPage";
import ProfileLayout from "@/components/ProfileLayout";
import ProfilePage from "@/pages/ProfilePage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";

// ─── App wrapper: background location pattern için gerekli ────

function AppRoutes() {
  const location = useLocation();
  // Modal açıkken arka planda kalan sayfa
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation ?? location}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/projects/:id" element={<ProjectLayout />}>
            <Route index element={<ProjectOverviewPage />} />
            {/* Board sayfası (Kanban + liste görünümü) */}
            <Route path="board" element={<TasksBoardPage />} />
            {/* Görev listesi de board sayfasını açar (liste modu varsayılan) */}
            <Route path="tasks" element={<TasksBoardPage />} />
            {/* Görev detay — doğrudan URL ile açılırsa tam sayfa */}
            <Route path="tasks/:taskId" element={<TaskDetailModal />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="labels" element={<LabelsPage />} />
            <Route path="settings" element={<ProjectSettingsPage />} />
          </Route>

          <Route path="/profile" element={<ProfileLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="password" element={<ChangePasswordPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>

      {/* Background location pattern: modal olarak görev detay */}
      {backgroundLocation && (
        <Routes>
          <Route
            path="/projects/:id/tasks/:taskId"
            element={<TaskDetailModal />}
          />
        </Routes>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
