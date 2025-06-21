import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { StoreManagement } from './pages/admin/StoreManagement';
import { UserDashboard } from './pages/user/UserDashboard';
import { UpdatePassword } from './pages/user/UpdatePassword';
import { StoreDashboard } from './pages/store/StoreDashboard';
import { Unauthorized } from './pages/common/Unauthorized';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  const getDashboardRoute = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'store_owner':
        return '/store/dashboard';
      case 'user':
        return '/user/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to={getDashboardRoute()} replace /> : <LoginForm />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to={getDashboardRoute()} replace /> : <SignupForm />} 
      />
      
      {/* Protected Routes */}
      <Route path="/" element={<Navigate to={getDashboardRoute()} replace />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <StoreManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* User Routes */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Layout>
              <UserDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Store Owner Routes */}
      <Route
        path="/store/dashboard"
        element={
          <ProtectedRoute allowedRoles={['store_owner']}>
            <Layout>
              <StoreDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Common Routes */}
      <Route
        path="/update-password"
        element={
          <ProtectedRoute>
            <Layout>
              <UpdatePassword />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;