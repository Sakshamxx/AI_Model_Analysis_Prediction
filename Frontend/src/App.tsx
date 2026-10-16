import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AssistantPage from './pages/AssistantPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/predict" element={<PredictPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
