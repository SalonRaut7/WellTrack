import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Mood from "./pages/MoodTracker";
import Sleep from "./pages/SleepTracker";
import Steps from "./pages/StepsTracker";
import Hydration from "./pages/HydrationTracker";
import Habits from "./pages/HabitsTracker";
import Analytics from "./pages/Analytics";

import AdminDashboard from "./pages/AdminDashboard";
import UserList from "./pages/UserList";
import UserDetails from "./pages/UserDetails";

import NavBar from "./components/NavBar";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProfilePage from "./pages/Profile";
import FoodTracker from "./pages/FoodTracker";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user?.roles?.includes("Admin")) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {isAuthenticated && <NavBar />}
      <div className={isAuthenticated ? "pt-20" : ""}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute><AdminRoute><AdminDashboard /></AdminRoute></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute><AdminRoute><UserList /></AdminRoute></PrivateRoute>} />
          <Route path="/admin/user/:id" element={<PrivateRoute><AdminRoute><UserDetails /></AdminRoute></PrivateRoute>} />

          {/* User Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/mood" element={<PrivateRoute><Mood /></PrivateRoute>} />
          <Route path="/sleep" element={<PrivateRoute><Sleep /></PrivateRoute>} />
          <Route path="/steps" element={<PrivateRoute><Steps /></PrivateRoute>} />
          <Route path="/hydration" element={<PrivateRoute><Hydration /></PrivateRoute>} />
          <Route path="/habits" element={<PrivateRoute><Habits /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          <Route path="/food" element={<PrivateRoute><FoodTracker /></PrivateRoute>} />

        </Routes>
      </div>
    </div>
  );
}

