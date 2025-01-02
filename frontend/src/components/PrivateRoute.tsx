import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { validateToken } from '../store/slices/authSlice';
import { CircularProgress, Box } from '@mui/material';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log('PrivateRoute mounted, current state:', {
      isAuthenticated,
      user: user ? { ...user, role: user.role } : null,
      loading,
      error,
      path: location.pathname
    });

    // Validate token on mount and when path changes
    if (!loading && !error) {
      dispatch(validateToken());
    }
  }, [location.pathname, dispatch, loading, error]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  console.log('PrivateRoute check:', {
    isAuthenticated,
    userRole: user?.role,
    requiredRoles: roles,
    hasRequiredRole: roles ? roles.includes(user?.role || '') : true
  });

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role || '')) {
    console.log('User role not allowed:', user?.role);
    console.log('Allowed roles:', roles);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
