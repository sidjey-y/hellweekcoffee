import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useSnackbar } from 'notistack';
import { userAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

type FormData = Omit<User, 'id'>;

interface AddFormData extends FormData {
  password: string;
  birthDate: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  birthDate?: string;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState<User[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<FormData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addFormData, setAddFormData] = useState<AddFormData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    birthDate: '',
  });
  const [addFormErrors, setAddFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userAPI.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await userAPI.deleteUser(userToDelete.username);
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
    }
  };

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setEditFormData({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!userToEdit) return;

    try {
      const userData = {
        username: editFormData.username,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email || undefined,
        phone: editFormData.phone || undefined,
        role: editFormData.role,
      };

      await userAPI.updateUser(userToEdit.id.toString(), userData);
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      setEditDialogOpen(false);
      setUserToEdit(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      enqueueSnackbar('Failed to update user', { variant: 'error' });
    }
  };

  const validateAddForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!addFormData.username.trim()) {
      errors.username = 'Username is required';
    }
    if (!addFormData.password.trim()) {
      errors.password = 'Password is required';
    } else if (addFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!addFormData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!addFormData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (addFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addFormData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!addFormData.role) {
      errors.role = 'Role is required';
    }
    if (!addFormData.birthDate) {
      errors.birthDate = 'Birth date is required';
    } else {
      const birthDate = new Date(addFormData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        errors.birthDate = 'Birth date must be in the past';
      }
    }

    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async () => {
    if (!validateAddForm()) {
      return;
    }

    try {
      const userData = {
        username: addFormData.username,
        firstName: addFormData.firstName,
        lastName: addFormData.lastName,
        email: addFormData.email || undefined,
        phone: addFormData.phone || undefined,
        role: addFormData.role,
        password: addFormData.password,
        birthDate: addFormData.birthDate,
      };

      await userAPI.createUser(userData);
      enqueueSnackbar('User created successfully', { variant: 'success' });
      setAddDialogOpen(false);
      setAddFormData({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        password: '',
        birthDate: '',
      });
      setAddFormErrors({});
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      setAddFormErrors(prev => ({
        ...prev,
        username: errorMessage
      }));
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      });
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#4d351d' }} elevation={1}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img src="/assets/logo2.png" alt="Hell Week Coffee Logo" style={{ height: 50 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Hell Week Coffee
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#EEDCC6',
        pt: 4,
        pb: 4
      }}>
        <Container maxWidth="xl">
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
            backgroundColor: 'white',
            p: 2,
            borderRadius: 1,
            boxShadow: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                edge="start" 
                onClick={() => navigate('/admin/dashboard')}
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4d351d' }}>
                  Manage Users
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View and manage system users
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              sx={{ 
                backgroundColor: '#4d351d',
                '&:hover': {
                  backgroundColor: '#362513'
                }
              }}
            >
              Add New User
            </Button>
          </Box>

          {/* Table Section */}
          <Paper 
            elevation={3}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: 'white'
            }}
          >
            <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#4d351d', color: 'white', fontSize: '0.95rem' }}>
                      Username
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#4d351d', color: 'white', fontSize: '0.95rem' }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#4d351d', color: 'white', fontSize: '0.95rem' }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#4d351d', color: 'white', fontSize: '0.95rem' }}>
                      Phone
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#4d351d', color: 'white', fontSize: '0.95rem' }}>
                      Role
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#4d351d', color: 'white', fontSize: '0.95rem' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow 
                      key={user.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: '#f5f5f5',
                          transition: 'background-color 0.2s'
                        }
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.9rem' }}>{user.username}</TableCell>
                      <TableCell sx={{ fontSize: '0.9rem' }}>{`${user.firstName} ${user.lastName}`}</TableCell>
                      <TableCell sx={{ fontSize: '0.9rem' }}>{user.email || '-'}</TableCell>
                      <TableCell sx={{ fontSize: '0.9rem' }}>{user.phone || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          sx={{ 
                            backgroundColor: '#4d351d',
                            color: 'white',
                            fontWeight: 'medium'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            onClick={() => handleEditClick(user)}
                            color="primary"
                            size="small"
                            title="Edit User"
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: '#e3f2fd'
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteClick(user)}
                            color="error"
                            size="small"
                            title="Delete User"
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: '#ffebee'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" color="text.secondary">
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                width: '100%',
                maxWidth: '400px'
              }
            }}
          >
            <DialogTitle 
              sx={{ 
                backgroundColor: '#ffebee',
                color: '#d32f2f',
                fontWeight: 'bold'
              }}
            >
              Confirm Delete
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Typography>
                Are you sure you want to delete user{' '}
                <strong>{userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : ''}</strong>?
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button 
                onClick={() => setDeleteDialogOpen(false)}
                sx={{ color: 'text.secondary' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm} 
                variant="contained" 
                color="error"
                sx={{ 
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#d32f2f'
                  }
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                width: '100%',
                maxWidth: '500px'
              }
            }}
          >
            <DialogTitle 
              sx={{ 
                backgroundColor: '#4d351d',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              Edit User
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={editFormData.username}
                  disabled
                />
                <TextField
                  fullWidth
                  label="First Name"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={editFormData.role}
                    label="Role"
                    onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="MANAGER">Manager</MenuItem>
                    <MenuItem value="CASHIER">Cashier</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button 
                onClick={() => setEditDialogOpen(false)}
                sx={{ color: 'text.secondary' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditSubmit}
                variant="contained" 
                sx={{ 
                  backgroundColor: '#4d351d',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#362513'
                  }
                }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add User Dialog */}
          <Dialog
            open={addDialogOpen}
            onClose={() => {
              setAddDialogOpen(false);
              setAddFormErrors({});
            }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                width: '100%',
                maxWidth: '500px'
              }
            }}
          >
            <DialogTitle 
              sx={{ 
                backgroundColor: '#4d351d',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              Add New User
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={addFormData.username}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                  error={!!addFormErrors.username}
                  helperText={addFormErrors.username}
                  FormHelperTextProps={{
                    sx: { color: 'error.main' }
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={addFormData.password}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  error={!!addFormErrors.password}
                  helperText={addFormErrors.password}
                  FormHelperTextProps={{
                    sx: { color: 'error.main' }
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="First Name"
                  value={addFormData.firstName}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  error={!!addFormErrors.firstName}
                  helperText={addFormErrors.firstName}
                  FormHelperTextProps={{
                    sx: { color: 'error.main' }
                  }}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={addFormData.lastName}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  error={!!addFormErrors.lastName}
                  helperText={addFormErrors.lastName}
                  FormHelperTextProps={{
                    sx: { color: 'error.main' }
                  }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, email: e.target.value }))}
                  error={!!addFormErrors.email}
                  helperText={addFormErrors.email}
                  FormHelperTextProps={{
                    sx: { color: 'error.main' }
                  }}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
                <TextField
                  fullWidth
                  label="Birth Date"
                  type="date"
                  value={addFormData.birthDate}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  required
                  error={!!addFormErrors.birthDate}
                  helperText={addFormErrors.birthDate}
                  FormHelperTextProps={{
                    sx: { color: 'error.main' }
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <FormControl 
                  fullWidth 
                  required
                  error={!!addFormErrors.role}
                >
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={addFormData.role}
                    label="Role"
                    onChange={(e) => setAddFormData(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="MANAGER">Manager</MenuItem>
                    <MenuItem value="CASHIER">Cashier</MenuItem>
                  </Select>
                  {addFormErrors.role && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 0.5, ml: 2 }}>
                      {addFormErrors.role}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button 
                onClick={() => {
                  setAddDialogOpen(false);
                  setAddFormErrors({});
                }}
                sx={{ color: 'text.secondary' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddSubmit}
                variant="contained" 
                sx={{ 
                  backgroundColor: '#4d351d',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#362513'
                  }
                }}
              >
                Add User
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </>
  );
};

export default UserManagement; 