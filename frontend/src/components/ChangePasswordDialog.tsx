import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  Typography,
} from '@mui/material';
import PasswordInput from './PasswordInput';
import { useSnackbar } from 'notistack';
import { axiosInstance } from '../utils/axios';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) errors.push(`At least ${minLength} characters long`);
  if (!hasUpperCase) errors.push('One uppercase letter');
  if (!hasLowerCase) errors.push('One lowercase letter');
  if (!hasNumbers) errors.push('One number');
  if (!hasSpecialChar) errors.push('One special character');

  return errors;
};

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ open, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    setValidationErrors(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError('Please fix all password requirements');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      handleClose();
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('Current password is incorrect');
      } else {
        setError(error.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setValidationErrors([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: '#230C02' }}>
        Change Password
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              fullWidth
              error={error === 'Current password is incorrect'}
              helperText={error === 'Current password is incorrect' ? error : ''}
            />
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              required
              fullWidth
              error={validationErrors.length > 0}
            />
            {validationErrors.length > 0 && (
              <Box sx={{ mt: -1 }}>
                <Typography variant="caption" color="error" component="div" sx={{ fontWeight: 'medium' }}>
                  Password must have:
                </Typography>
                {validationErrors.map((error, index) => (
                  <Typography key={index} variant="caption" color="error" component="div">
                    • {error}
                  </Typography>
                ))}
              </Box>
            )}
            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              error={newPassword !== confirmPassword && confirmPassword !== ''}
              helperText={newPassword !== confirmPassword && confirmPassword !== '' ? 'Passwords do not match' : ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || validationErrors.length > 0}
            sx={{
              backgroundColor: '#230C02',
              '&:hover': {
                backgroundColor: '#430E04',
              },
            }}
          >
            Change Password
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChangePasswordDialog; 