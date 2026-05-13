import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute";
import ProjectLayout from "@/components/ProjectLayout";
import ProfileLayout from "@/components/ProfileLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import TasksBoardPage from "@/pages/TasksBoardPage";
import TaskDetailModal from "@/components/tasks/TaskDetailModal";
import SprintsPage from "@/pages/SprintsPage";
import ProjectOverviewPage from "@/pages/ProjectOverviewPage";
import ProjectSettingsPage from "@/pages/ProjectSettingsPage";
import MembersPage from "@/pages/MembersPage";
import LabelsPage from "@/pages/LabelsPage";
import ProfilePage from "@/pages/ProfilePage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";
import NotificationsPage from "@/pages/NotificationsPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { Toaster } from "sonner";

export default function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      {/* Tüm ana rotaları TEK BİR Routes bloğunda topluyoruz */}
      <Routes location={backgroundLocation ?? location}>
        {/* Kamu Rotaları */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Korumalı Rotaları */}
        <Route element={<ProtectedRoute />}>
          {/* Ana Sayfalar */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Proje Detay Rotaları */}
          <Route path="/projects/:id" element={<ProjectLayout />}>
            <Route index element={<ProjectOverviewPage />} />
            <Route path="board" element={<TasksBoardPage />} />
            <Route path="tasks" element={<TasksBoardPage />} />
            <Route path="tasks/:taskId" element={<TasksBoardPage />} />
            <Route path="sprints" element={<SprintsPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="labels" element={<LabelsPage />} />
            <Route path="settings" element={<ProjectSettingsPage />} />
          </Route>

          {/* Profil Rotaları */}
          <Route path="/profile" element={<ProfileLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="password" element={<ChangePasswordPage />} />
          </Route>

          {/* Kök dizini dashboard'a yönlendir */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* 404 Sayfası */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Modal Rotası - Sadece backgroundLocation varsa çalışır */}
      {backgroundLocation && (
        <Routes>
          <Route
            path="/projects/:id/tasks/:taskId"
            element={<TaskDetailModal />}
          />
        </Routes>
      )}

      <Toaster richColors position="bottom-right" closeButton />
    </>
  );
}
