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

export default function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation ?? location}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          <Route path="/projects/:id" element={<ProjectLayout />}>
            <Route index element={<ProjectOverviewPage />} />
            {/* Board ve List görünümleri ile direkt görev ziyaretleri aynı arka planı kullanır */}
            <Route path="board" element={<TasksBoardPage />} />
            <Route path="tasks" element={<TasksBoardPage />} />
            <Route path="tasks/:taskId" element={<TasksBoardPage />} />

            <Route path="sprints" element={<SprintsPage />} />
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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Modal her zaman en üstte Route olarak tetiklenir (Background olsun ya da olmasın) */}
      <Routes>
        <Route
          path="/projects/:id/tasks/:taskId"
          element={<TaskDetailModal />}
        />
      </Routes>
    </>
  );
}
