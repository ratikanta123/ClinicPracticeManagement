import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import PatientBooking from './pages/PatientBooking';
import { PatientDashboard, DoctorDashboard, AdminDashboard } from './pages/Dashboards';

const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: string[] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to their own dashboard
  }

  return <>{children}</>;
};

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  if (user.role === 'PATIENT') return <PatientDashboard />;
  if (user.role === 'DOCTOR') return <DoctorDashboard />;
  if (user.role === 'ADMIN') return <AdminDashboard />;
  return <div>Unknown Role</div>;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <RoleBasedDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Patient Routes */}
      <Route path="/book" element={
        <ProtectedRoute allowedRoles={['PATIENT']}>
          <Layout>
            <PatientBooking />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/my-appointments" element={
        <ProtectedRoute allowedRoles={['PATIENT']}>
          <Layout>
            <PatientDashboard /> {/* Reuse dash for list view for now */}
          </Layout>
        </ProtectedRoute>
      } />

      {/* Doctor Routes */}
      <Route path="/schedule" element={
        <ProtectedRoute allowedRoles={['DOCTOR']}>
          <Layout>
            <DoctorDashboard /> {/* Reuse for now */}
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;