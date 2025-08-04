import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
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

const drawerWidth = 240;

export default function DashboardLayout({ children, navItems = [], pageTitle = "EcoDrop" }) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsMounted(true);
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    } else {
      router.push('/');
    }
  }, [router]);

  // Default navItems if none are provided
  const defaultNavItems = [
    { name: t('sidebar.materials'), path: '/dashboard/materials', icon: <Recycling /> },
    { name: t('sidebar.collections'), path: '/dashboard/collections', icon: <LocalShipping /> },
    { name: t('sidebar.profile'), path: '/dashboard/profile', icon: <Person /> },
  ];

  const currentNavItems = navItems.length > 0 ? navItems : defaultNavItems;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
              onClick={() => {
                if (item.path) {
                    router.push(item.path);
                } else if (item.onClick) {
                    item.onClick();
                }
                if (isMobile) {
                    setMobileOpen(false);
                }
              }}
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
              <ListItemIcon sx={{ color: router.pathname === item.path ? 'primary.contrastText' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        {isMounted && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#4CAF50' }}>
              {user.profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {user.profile?.name || t('sidebar.user')}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {user.email || 'user@example.com'}
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
            {t('sidebar.logout')}
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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // MODIFIED: Added responsive padding
          p: { xs: 2, sm: 3 }, 
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
