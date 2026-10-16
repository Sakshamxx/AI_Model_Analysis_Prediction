import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
