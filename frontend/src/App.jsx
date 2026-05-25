import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const AITaskAnalyzer = lazy(() => import('./pages/AITaskAnalyzer.jsx'));
const TaskBoard = lazy(() => import('./pages/TaskBoard.jsx'));
const ChatAssistant = lazy(() => import('./pages/ChatAssistant.jsx'));
const ProgressTracking = lazy(() => import('./pages/ProgressTracking.jsx'));
const TeamAnalytics = lazy(() => import('./pages/TeamAnalytics.jsx'));
const TeamHub = lazy(() => import('./pages/TeamHub.jsx'));
const WorkflowManager = lazy(() => import('./pages/WorkflowManager.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );
}

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
          <Route index element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
          <Route path="analyzer" element={<Suspense fallback={<PageLoader />}><AITaskAnalyzer /></Suspense>} />
          <Route path="tasks" element={<Suspense fallback={<PageLoader />}><TaskBoard /></Suspense>} />
          <Route path="chat" element={<Suspense fallback={<PageLoader />}><ChatAssistant /></Suspense>} />
          <Route path="progress" element={<Suspense fallback={<PageLoader />}><ProgressTracking /></Suspense>} />
          <Route path="team" element={<Suspense fallback={<PageLoader />}><TeamAnalytics /></Suspense>} />
          <Route path="team-hub" element={<Suspense fallback={<PageLoader />}><TeamHub /></Suspense>} />
          <Route path="workflows" element={<Suspense fallback={<PageLoader />}><WorkflowManager /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
