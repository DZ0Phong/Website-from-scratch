import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/notebook" replace />} />

      <Route path="/notebook" element={<HomePage />} />
      <Route path="/notebook/login" element={<LoginPage />} />
      <Route path="/notebook/register" element={<RegisterPage />} />
    </Routes>
  );
}
