import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./components/admin/AdminLogin.jsx";
import Register from "./pages/Register.jsx";
import UserLogin from "./pages/UserLogin.jsx";
import ContactForm from "./pages/Contact.jsx";
import HomePage from "./pages/HomePage.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ReservationPage from "./pages/ReservationPage.jsx";


function App() {
  return (
    <Routes>
      
      <Route path="/" element={<Navigate to="/user/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/contact" element={<ContactForm />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/reservation" element={<ReservationPage />} />
    </Routes>
  );
}

export default App;
