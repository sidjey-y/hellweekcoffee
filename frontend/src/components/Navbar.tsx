import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { useSelector } from 'react-redux';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Navbar = () => {
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const user = useSelector((state: any) => state.auth.user);
  const [itemsAnchorEl, setItemsAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleItemsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setItemsAnchorEl(event.currentTarget);
  };

  const handleItemsMenuClose = () => {
    setItemsAnchorEl(null);
  };

  const categories = {
    'Drinks': {
      'Espresso Drinks': [],
      'Blended Drinks': [],
      'Tea': [],
      'Others': []
    },
    'Food': {
      'Pastries': [],
      'Cakes': [],
      'Sandwiches': [],
      'Pastas': [],
      'Others': []
    },
    'Merchandise': {
      'T-Shirts': [],
      'Bags': [],
      'Mugs': [],
      'Others': []
    }
  };

  const renderNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Button
            component={RouterLink}
            to="/membership"
            color="inherit"
          >
            Membership
          </Button>
          <Button
            component={RouterLink}
            to="/rewards"
            color="inherit"
          >
            Rewards
          </Button>
          <Button
            component={RouterLink}
            to="/about"
            color="inherit"
          >
            About
          </Button>
        </>
      );
    }

    // Admin navigation
    if (user?.role === 'ADMIN') {
      return (
        <>
          <Button
            component={RouterLink}
            to="/admin/dashboard"
            color="inherit"
          >
            Dashboard
          </Button>
          <Button
            component={RouterLink}
            to="/admin/users"
            color="inherit"
          >
            Users
          </Button>
          <Button
            component={RouterLink}
            to="/admin/items"
            color="inherit"
          >
            Items
          </Button>
          <Button
            component={RouterLink}
            to="/admin/reports"
            color="inherit"
          >
            Reports
          </Button>
        </>
      );
    }

    // Manager navigation
    if (user?.role === 'MANAGER') {
      return (
        <>
          <Button
            component={RouterLink}
            to="/manager/dashboard"
            color="inherit"
          >
            Dashboard
          </Button>
          <Button
            component={RouterLink}
            to="/manager/inventory"
            color="inherit"
          >
            Inventory
          </Button>
          <Button
            component={RouterLink}
            to="/manager/reports"
            color="inherit"
          >
            Reports
          </Button>
        </>
      );
    }

    // Cashier navigation
    if (user?.role === 'CASHIER') {
      return (
        <>
          <Button
            component={RouterLink}
            to="/pos"
            color="inherit"
          >
            POS
          </Button>
          <Button
            component={RouterLink}
            to="/orders"
            color="inherit"
          >
            Orders
          </Button>
        </>
      );
    }

    // Customer navigation
    return (
      <>
        <Button
          component={RouterLink}
          to="/dashboard"
          color="inherit"
        >
          Dashboard
        </Button>
        <Button
          component={RouterLink}
          to="/membership"
          color="inherit"
        >
          Membership
        </Button>
        <Button
          component={RouterLink}
          to="/rewards"
          color="inherit"
        >
          Rewards
        </Button>
        <Button
          component={RouterLink}
          to="/orders"
          color="inherit"
        >
          Orders
        </Button>
        <Button
          color="inherit"
          onClick={handleItemsMenuOpen}
          endIcon={<KeyboardArrowDownIcon />}
        >
          Items
        </Button>
        <Menu
          anchorEl={itemsAnchorEl}
          open={Boolean(itemsAnchorEl)}
          onClose={handleItemsMenuClose}
        >
          {Object.entries(categories).map(([category, subcategories]) => (
            <div key={category}>
              <MenuItem
                onClick={handleItemsMenuClose}
                component={RouterLink}
                to={`/items/${category.toLowerCase()}`}
                sx={{ fontWeight: 'bold' }}
              >
                {category}
              </MenuItem>
              {Object.keys(subcategories).map((subcat) => (
                <MenuItem
                  key={subcat}
                  onClick={handleItemsMenuClose}
                  component={RouterLink}
                  to={`/items/${category.toLowerCase()}/${subcat.toLowerCase().replace(' ', '-')}`}
                  sx={{ pl: 4 }}
                >
                  {subcat}
                </MenuItem>
              ))}
            </div>
          ))}
        </Menu>
      </>
    );
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: 'flex',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HELLWEEK COFFEE
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            {renderNavLinks()}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  to="/profile"
                  color="inherit"
                >
                  Profile
                </Button>
                <Button
                  component={RouterLink}
                  to="/logout"
                  color="inherit"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  color="inherit"
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
