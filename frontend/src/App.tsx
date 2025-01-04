import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Login from './pages/Login';
import POS from './pages/POS';
import AdminDashboard from './pages/AdminDashboard';
import Items from './pages/Items';
import AdminUsers from './pages/AdminUsers';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { validateToken } from './store/slices/authSlice';
import { AppDispatch } from './store';
import { AuthProvider } from './components/AuthProvider';
import { setAuthErrorHandler } from './utils/axios';
import PrivateRoute from './components/PrivateRoute';
import CustomerManagement from './pages/CustomerManagement';
import TransactionHistory from './pages/TransactionHistory';
import ManagerDashboard from './pages/ManagerDashboard';
import UserManagement from './pages/UserManagement';

const RoleBasedRedirect = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === 'CASHIER') {
    return <Navigate to="/pos" replace />;
  } else if (user?.role === 'MANAGER') {
    return <Navigate to="/manager/items" replace />;
  }
  
  // Default fallback
  return <Navigate to="/login" replace />;
};

// Protected routes for managers
const managerRoutes = [
  { path: '/manager/dashboard', element: <ManagerDashboard /> },
  { path: '/manager/items', element: <Items /> },
  { path: '/pos', element: <POS /> },
  { path: '/customer-management', element: <CustomerManagement /> },
];

// Protected routes for admins
const adminRoutes = [
  { path: '/admin/dashboard', element: <AdminDashboard /> },
  { path: '/admin/users', element: <UserManagement /> },
  { path: '/admin/items', element: <Items /> },
  { path: '/pos', element: <POS /> },
  { path: '/customer-management', element: <CustomerManagement /> },
];

// Protected routes for cashiers
const cashierRoutes = [
  { path: '/pos', element: <POS /> },
  { path: '/customer-management', element: <CustomerManagement /> },
];

function AppContent() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but on login page, redirect based on role
  if (isAuthenticated && location.pathname === '/login') {
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'MANAGER') return <Navigate to="/manager/dashboard" replace />;
    if (user?.role === 'CASHIER') return <Navigate to="/pos" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Public routes */}
      <Route path="/" element={<RoleBasedRedirect />} />
      
      {/* Protected routes */}
      {isAuthenticated && (
        <>
          {user?.role === 'ADMIN' && adminRoutes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          
          {user?.role === 'MANAGER' && managerRoutes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          
          {user?.role === 'CASHIER' && cashierRoutes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </>
      )}
      
      {/* Catch all route */}
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
