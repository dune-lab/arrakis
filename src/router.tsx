import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CreateStudent } from './pages/onboarding/CreateStudent';
import { StartJourney } from './pages/onboarding/StartJourney';
import { Students } from './pages/admin/Students';
import { Journeys } from './pages/admin/Journeys';

export function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/onboarding/student" element={<ProtectedRoute><CreateStudent /></ProtectedRoute>} />
      <Route path="/onboarding/journey" element={<ProtectedRoute><StartJourney /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
      <Route path="/admin/journeys" element={<ProtectedRoute><Journeys /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
