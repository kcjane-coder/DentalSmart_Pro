
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientLayout from './components/PatientLayout';
import Notifications from './pages/patient/Notifications';
import AIAssistance from './pages/patient/AIAssistance';
import AppointmentHistory from './pages/patient/AppointmentHistory';

// Profile
import Profile from './components/profile.jsx';

// Admin
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDentist from './pages/admin/AdminDentist';
import AdminStaff from './pages/admin/AdminStaff';

// Dentist
import DentistLayout from './components/DentistLayout';
import DentistDashboard from './pages/dentist/DentistDashboard';

// Staff
import StaffLayout from './components/StaffLayout';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffPosts from './pages/staff/StaffPosts';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC PAGES */}

        <Route path="/" element={<LandingPage />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />


        {/* PATIENT PAGES */}

        <Route path="/patient" element={<PatientLayout />}>

          <Route path="dashboard" element={<PatientDashboard />} />

          <Route path="notifications" element={<Notifications />} />

          <Route path="profile" element={<Profile />} />

          <Route
            path="appointment-history"
            element={<AppointmentHistory />}
          />

          <Route
            path="ai-assistance"
            element={<AIAssistance />}
          />

        </Route>


        {/* ADMIN PAGES */}

        <Route path="/admin" element={<AdminLayout />}>

          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="users" element={<AdminUsers />} />

          <Route path="dentists" element={<AdminDentist />} />

          <Route path="staff" element={<AdminStaff />} />

          <Route path="profile" element={<Profile />} />

        </Route>


        {/* STAFF PAGES */}

        <Route path="/staff" element={<StaffLayout />}>

          <Route path="dashboard" element={<StaffDashboard />} />

          <Route path="posts" element={<StaffPosts />} />

          <Route path="profile" element={<Profile />} />

        </Route>


        {/* DENTIST PAGES */}

        <Route path="/dentist" element={<DentistLayout />}>

          <Route path="dashboard" element={<DentistDashboard />} />
          
          <Route path="profile" element={<Profile />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
