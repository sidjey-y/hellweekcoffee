import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Login from './pages/Login';
import POS from './pages/POS';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import Items from './pages/Items';
import AdminUsers from './pages/AdminUsers';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { validateToken } from './store/slices/authSlice';
import { AppDispatch } from './store';
import { AuthProvider } from './components/AuthProvider';
import { setAuthErrorHandler } from './utils/axios';

const PrivateRoute = ({ children, roles }: { children: React.ReactNode; roles: string[] }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const RoleBasedRedirect = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === 'CASHIER') {
    return <Navigate to="/pos" replace />;
  } else if (user?.role === 'MANAGER') {
    return <Navigate to="/manager/dashboard" replace />;
  }
  
  // Default fallback
  return <Navigate to="/login" replace />;
};

function AppContent() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(validateToken());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <PrivateRoute roles={['ADMIN']}>
            <AdminDashboard />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/admin/items" 
        element={
          <PrivateRoute roles={['ADMIN', 'MANAGER']}>
            <Items />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/admin/inventory" 
        element={
          <PrivateRoute roles={['ADMIN', 'MANAGER']}>
            <Items />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/admin/users" 
        element={
          <PrivateRoute roles={['ADMIN']}>
            <AdminUsers />
          </PrivateRoute>
        } 
      />

      {/* Manager Routes */}
      <Route 
        path="/manager/dashboard" 
        element={
          <PrivateRoute roles={['MANAGER']}>
            <ManagerDashboard />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/manager/items" 
        element={
          <PrivateRoute roles={['MANAGER']}>
            <Items />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/manager/inventory" 
        element={
          <PrivateRoute roles={['MANAGER']}>
            <Items />
          </PrivateRoute>
        } 
      />

      {/* POS Route */}
      <Route 
        path="/pos" 
        element={
          <PrivateRoute roles={['ADMIN', 'CASHIER']}>
            <POS />
          </PrivateRoute>
        } 
      />

      {/* Root Route */}
      <Route 
        path="/" 
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <RoleBasedRedirect />
          )
        } 
      />

      {/* Catch all other routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
