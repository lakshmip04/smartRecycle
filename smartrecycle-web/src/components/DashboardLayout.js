import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Box,
} from '@mui/material';
import {
  Recycling,
  LocalShipping,
  Person,
} from '@mui/icons-material';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavigationValue = () => {
    if (location.pathname.includes('materials')) return 0;
    if (location.pathname.includes('collections')) return 1;
    if (location.pathname.includes('profile')) return 2;
    return 0;
  };

  const handleNavigationChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate('/dashboard/materials');
        break;
      case 1:
        navigate('/dashboard/collections');
        break;
      case 2:
        navigate('/dashboard/profile');
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar position="static" sx={{ backgroundColor: '#4CAF50' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SmartRecycle Collector
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          flex: 1, 
          py: 2, 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 'calc(100vh - 120px)' 
        }}
      >
        <Outlet />
      </Container>

      {/* Bottom Navigation */}
      <Paper 
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} 
        elevation={3}
      >
        <BottomNavigation
          value={getNavigationValue()}
          onChange={handleNavigationChange}
          showLabels
          sx={{
            '& .MuiBottomNavigationAction-root.Mui-selected': {
              color: '#2E7D32',
            },
          }}
        >
          <BottomNavigationAction
            label="Materials"
            icon={<Recycling />}
          />
          <BottomNavigationAction
            label="Collections"
            icon={<LocalShipping />}
          />
          <BottomNavigationAction
            label="Profile"
            icon={<Person />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default DashboardLayout; 