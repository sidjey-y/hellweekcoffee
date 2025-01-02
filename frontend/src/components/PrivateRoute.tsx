import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { validateToken, clearError } from '../store/slices/authSlice';
import { CircularProgress, Box } from '@mui/material';
import { getAuthToken } from '../utils/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);
  const [initialValidationDone, setInitialValidationDone] = useState(false);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());

    const token = getAuthToken();
    
    // Only validate on initial mount if there's a token
    if (!initialValidationDone && token) {
      console.log('Initial token validation');
      dispatch(validateToken());
      setInitialValidationDone(true);
    } else if (!token) {
      setInitialValidationDone(true); // Skip validation if no token
    }
  }, [dispatch, initialValidationDone]);

  // Show loading only during initial validation
  if (loading && !initialValidationDone) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If no token or validation failed, redirect to login
  if (!isAuthenticated || !user) {
    // Don't log the message if we're already on the login page
    if (!location.pathname.includes('/login')) {
      console.log('Not authenticated, redirecting to login');
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles) {
    const userRole = user.role.toUpperCase();
    const allowedRoles = roles.map(role => role.toUpperCase());
    
    console.log('Role check:', {
      userRole,
      allowedRoles,
      hasAccess: allowedRoles.includes(userRole)
    });

    if (!allowedRoles.includes(userRole)) {
      console.log('User role not allowed:', userRole);
      console.log('Allowed roles:', allowedRoles);
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
