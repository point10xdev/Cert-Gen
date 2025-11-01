import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import GeneratePage from './pages/Generate';
import VerifyPage from './pages/Verify';
import TemplateManagement from './pages/TemplateManagement';
import RegisterPage from './pages/Register'; 

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> 
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/templates" element={<TemplateManagement />} />
          <Route path="/verify" element={<VerifyPage />} /> 
          <Route path="/verify/:code" element={<VerifyPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </>
  );
}

export default App;