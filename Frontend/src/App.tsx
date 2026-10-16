import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import PredictPage from './pages/PredictPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/predict" element={<PredictPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
