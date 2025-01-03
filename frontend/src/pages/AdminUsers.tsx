import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Snackbar,
  Alert,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import PasswordInput from '../components/PasswordInput';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  birthDate: string | null;
}

interface UserData {
  username: string;
  password?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: string;
  birthDate: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
      dispatch(logout());
      navigate('/login');
    };

  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'CASHIER',
    birthDate: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fetchUsers = useCallback(async () => {
    try {
      const data = await userAPI.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Failed to fetch users', 'error');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        password: '',
        confirmPassword: '',
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
        birthDate: user.birthDate || '',
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'CASHIER',
        birthDate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const validateForm = () => {
    if (!formData.username || !formData.firstName || !formData.lastName || !formData.birthDate) {
      showSnackbar('Please fill in all required fields', 'error');
      return false;
    }

    if (!selectedUser && formData.password !== formData.confirmPassword) {
      showSnackbar('Passwords do not match', 'error');
      return false;
    }

    if (!selectedUser && !formData.password) {
      showSnackbar('Password is required for new users', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});

    // Validate required fields
    const newErrors: { [key: string]: string } = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.birthDate) newErrors.birthDate = 'Birth date is required';
    
    // Check for password mismatch
    if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check for password length
    if (formData.password.length < 8 ) {
        newErrors.password = 'Password must be at least 8 characters long';
    }

    // Check for birth date in the past
    const today = new Date();
    const birthDate = new Date(formData.birthDate);
    if (birthDate > today) {
        newErrors.birthDate = 'Birth date must be in the past';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    //Check for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
    }

    //Check if user already exists
    if (selectedUser) {
        const existingUser = users.find(user => user.username === formData.username);
        if (existingUser && existingUser.id !== selectedUser.id) {
            newErrors.username = 'Username already exists';
        }
    }

    // If there are errors, set them and show snackbar messages
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        // Show all error messages through snackbar
        Object.values(newErrors).forEach(errorMessage => {
            showSnackbar(errorMessage, 'error');
        });
        return false; //??
    }

    try {
        const userData: UserData = {
            username: formData.username.trim(),
            password: formData.password,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim() || undefined,
            phone: formData.phone.trim() || undefined,
            role: formData.role,
            birthDate: formData.birthDate,
        };

        if (selectedUser) {
            if (!userData.password) {
                delete userData.password; // Remove password if not provided
            }
            await userAPI.updateUser(selectedUser.id.toString(), userData);
            showSnackbar('User updated successfully', 'success');
        } else {
            await userAPI.createUser(userData);
            showSnackbar('User created successfully', 'success');
        }

        handleCloseDialog();
        fetchUsers();
    } catch (error: any) {
        console.error('Error saving user:', error);
        showSnackbar(
            error.response?.data?.message || 'Failed to save user',
            'error'
        );
    }
};

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(id.toString());
        showSnackbar('User deleted successfully', 'success');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showSnackbar('Failed to delete user', 'error');
      }
    }
  };

  return (
    <>
    <AppBar position="static" sx={{ backgroundColor: '#4d351d', color: 'white' }} elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src="/assets/logo2.png"
            alt="Hell Week Coffee Logo"
            sx={{ height: 50 }} 
          />
          <Typography variant="h6" component="div" fontWeight="bold">
            Hell Week Coffee
          </Typography>
        </Box>
        <Button
          color="inherit"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
    
    <Box sx={{backgroundColor: '#EEDCC6', minHeight: '100vh', mt: 0, paddingTop: 4}}>
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/admin/dashboard')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{fontWeight: 'bold', color: '#230c02'}}>
          Manage Users
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ ml: 'auto', backgroundColor: '#4d351d'}}

        >
          Add New User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
          <TableRow sx={{backgroundColor: '#4d351d'}}>
                <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Username</TableCell>
                <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' , color: 'white'}}>Actions</TableCell>
          </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(user)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={!!selectedUser}
              />
            </Grid>
            {!selectedUser && (
              <>
                <Grid item xs={12}>
                  <PasswordInput
                    fullWidth
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <PasswordInput
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Birth Date"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="MANAGER">Manager</MenuItem>
                  <MenuItem value="CASHIER">Cashier</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
    </Box>
    </>
  );
};

export default AdminUsers;