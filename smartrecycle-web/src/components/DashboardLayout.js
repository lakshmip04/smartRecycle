import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Recycling,
  LocalShipping,
  Person,
  Nature,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';

const DashboardLayout = ({ children, navItems = [], pageTitle = "EcoDrop" }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Default navItems if none provided
  const defaultNavItems = [
    { name: 'Materials', path: '/dashboard/materials', icon: <Recycling /> },
    { name: 'Collections', path: '/dashboard/collections', icon: <LocalShipping /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <Person /> },
  ];

  const currentNavItems = navItems.length > 0 ? navItems : defaultNavItems;

  const handleNavigation = (path) => {
    router.push(path);
    setMobileOpen(false); // Close mobile drawer after navigation
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    // Redirect to login page
    router.push('/');
  };

  const drawerWidth = 240;

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Nature sx={{ color: '#4CAF50' }} />
        <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
          EcoDrop
        </Typography>
      </Box>
      <Divider />
      <List>
        {currentNavItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation(item.path)}
              selected={router.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#4CAF50',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: '#4CBF00',
                  },
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: router.pathname === item.path ? 'primary.contrastText' : 'inherit' 
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#4CAF50' }}>
            {typeof window !== 'undefined' && localStorage.getItem('user_data') 
              ? JSON.parse(localStorage.getItem('user_data'))?.profile?.name?.charAt(0)?.toUpperCase() || 'U'
              : 'U'
            }
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {typeof window !== 'undefined' && localStorage.getItem('user_data') 
                ? JSON.parse(localStorage.getItem('user_data'))?.profile?.name || 'User'
                : 'User'
              }
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {typeof window !== 'undefined' && localStorage.getItem('user_data') 
                ? JSON.parse(localStorage.getItem('user_data'))?.email || 'user@example.com'
                : 'user@example.com'
              }
            </Typography>
          </Box>
        </Box>
        
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: '#4CAF50',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {pageTitle}
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Toolbar /> {/* This adds space for the fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;