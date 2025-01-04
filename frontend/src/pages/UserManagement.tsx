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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useSnackbar } from 'notistack';
import { userAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState<User[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

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
      await userAPI.deleteUser(userToDelete.id.toString());
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
    }
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
              onClick={() => navigate('/admin/users/new')}
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
                      <TableCell sx={{ fontSize: '0.9rem' }}>{user.name}</TableCell>
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
                            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
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
                <strong>{userToDelete?.name}</strong>?
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
        </Container>
      </Box>
    </>
  );
};

export default UserManagement; 