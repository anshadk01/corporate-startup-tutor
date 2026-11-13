import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import { DashboardLayout } from "./layouts/DashboardLayout.tsx";
import { Login } from "./pages/Login.tsx";
import { Dashboard } from "./pages/Dashboard.tsx";
import { Reflections } from "./pages/Reflections.tsx";
import { News } from "./pages/News.tsx";
import { PromptLog } from "./pages/PromptLog.tsx";
import { GroupWorkspace } from "./pages/GroupWorkspace.tsx";
import { InstructorDashboard } from "./pages/InstructorDashboard.tsx";
import { InstructorGroupView } from "./pages/InstructorGroupView.tsx";
import { LoadingSpinner } from "./components/common/LoadingSpinner.tsx";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner message="Authenticating session..." size="lg" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const InstructorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== "INSTRUCTOR") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner message="Loading ENT 3805 Tutor Workspace..." size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="reflections" element={<Reflections />} />
        <Route path="news" element={<News />} />
        <Route path="prompt-log" element={<PromptLog />} />
        <Route path="workspace" element={<GroupWorkspace />} />

        {/* Instructor Specific Routes */}
        <Route
          path="instructor"
          element={
            <InstructorRoute>
              <InstructorDashboard />
            </InstructorRoute>
          }
        />
        <Route
          path="instructor/groups/:id"
          element={
            <InstructorRoute>
              <InstructorGroupView />
            </InstructorRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}