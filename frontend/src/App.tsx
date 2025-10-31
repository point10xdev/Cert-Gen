import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import GeneratePage from './pages/Generate';
import VerifyPage from './pages/Verify';
import TemplateManagement from './pages/TemplateManagement';
import RegisterPage from './pages/Register'; // <-- Import new page

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> {/* <-- Add new route */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/templates" element={<TemplateManagement />} />
          <Route path="/verify/:code" element={<VerifyPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </>
  );
}

export default App;