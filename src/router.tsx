import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
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
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding/student" element={<CreateStudent />} />
        <Route path="/onboarding/journey" element={<StartJourney />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/journeys" element={<Journeys />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
