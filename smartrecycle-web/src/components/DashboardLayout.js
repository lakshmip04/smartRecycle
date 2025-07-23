import React, { useState, useEffect } from 'react';
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
  Button // Added for logout button
} from '@mui/material';
import {
  Menu as MenuIcon,
  ExitToApp as LogoutIcon, // Added for logout button
  Nature
} from '@mui/icons-material';

const drawerWidth = 240;

// The Layout now accepts navItems and a pageTitle to be truly reusable
export default function DashboardLayout({ children, navItems, pageTitle }) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    } else {
      router.push('/'); // If no user, redirect to login
    }
  }, [router]);

  const handleNavigation = (path) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Nature sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          SmartRecycle
        </Typography>
      </Box>
      <Divider />
      <List>
        {/* The navItems are now passed in as a prop */}
        {navItems && navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation(item.path)}
              selected={router.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
              {user.profile?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {user.profile?.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
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
            {pageTitle || 'Dashboard'} {/* The pageTitle is now a prop */}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
