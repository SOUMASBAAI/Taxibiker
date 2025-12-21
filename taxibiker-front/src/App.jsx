import { Routes, Route } from "react-router-dom";
import AdminLogin from "./components/admin/AdminLogin.jsx";
import Register from "./pages/Register.jsx";
import UserLogin from "./pages/UserLogin.jsx";
import ContactForm from "./pages/Contact.jsx";
import HomePage from "./pages/HomePage.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import UserSettings from "./pages/UserSettings.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminClients from "./pages/AdminClients.jsx";
import AdminReservations from "./pages/AdminReservations.jsx";
import ReservationPage from "./pages/ReservationPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/contact" element={<ContactForm />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/settings" element={<UserSettings />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/clients" element={<AdminClients />} />
      <Route path="/admin/reservations" element={<AdminReservations />} />
      <Route path="/reservation" element={<ReservationPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;
