import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AITaskAnalyzer from './pages/AITaskAnalyzer.jsx';
import TaskBoard from './pages/TaskBoard.jsx';
import ChatAssistant from './pages/ChatAssistant.jsx';
import ProgressTracking from './pages/ProgressTracking.jsx';
import TeamAnalytics from './pages/TeamAnalytics.jsx';
import TeamHub from './pages/TeamHub.jsx';
import WorkflowManager from './pages/WorkflowManager.jsx';
import Settings from './pages/Settings.jsx';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="analyzer" element={<AITaskAnalyzer />} />
          <Route path="tasks" element={<TaskBoard />} />
          <Route path="chat" element={<ChatAssistant />} />
          <Route path="progress" element={<ProgressTracking />} />
          <Route path="team" element={<TeamAnalytics />} />
          <Route path="team-hub" element={<TeamHub />} />
          <Route path="workflows" element={<WorkflowManager />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
