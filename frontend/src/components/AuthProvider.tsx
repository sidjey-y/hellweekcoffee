import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export const AuthContext = React.createContext<{
  handleAuthError: () => void;
}>({
  handleAuthError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAuthError = React.useCallback(() => {
    dispatch(logout());
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);

  return (
    <AuthContext.Provider value={{ handleAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}; 