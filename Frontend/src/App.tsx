import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AssistantPage from './pages/AssistantPage';
import AuthPage from './pages/AuthPage';
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Router>
      {/* Dock parked for now — see src/components/Dock.tsx */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/predict" element={<PredictPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
