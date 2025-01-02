import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

interface AuthState {
  user: any;
  isAuthenticated: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state: { auth: AuthState }) => state.auth);
  const location = useLocation();

  console.log('ProtectedRoute Debug:', {
    user,
    isAuthenticated,
    allowedRoles,
    currentPath: location.pathname
  });

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    console.log('User role not allowed:', user?.role);
    console.log('Allowed roles:', allowedRoles);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
