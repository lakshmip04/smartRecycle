// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalShipping as TruckIcon,
  BarChart as ChartIcon,
  ExitToApp as LogoutIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import './AdminDashboard.css';

const drawerWidth = 240;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const systemStats = {
    totalUsers: 1247,
    totalCollectors: 89,
    materialsCollected: 3456,
    totalWeight: 12567, // kg
  };

  const pendingUsers = [
    { id: 1, name: 'John Smith', email: 'john@email.com', joinDate: '2024-01-15', location: 'Mumbai' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', joinDate: '2024-01-14', location: 'Delhi' },
    { id: 3, name: 'Mike Chen', email: 'mike@email.com', joinDate: '2024-01-13', location: 'Bangalore' },
  ];

  const pendingCollectors = [
    { id: 1, name: 'Green Waste Co.', email: 'green@waste.com', joinDate: '2024-01-12', zone: 'North Mumbai', license: 'GW001' },
    { id: 2, name: 'EcoCollect Services', email: 'eco@collect.com', joinDate: '2024-01-11', zone: 'South Delhi', license: 'EC002' },
  ];

  const aiClassificationStats = {
    biodegradable: 1845,
    nonBiodegradable: 1611,
    accuracy: 94.2,
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleApprove = (type, id) => {
    console.log(`Approved ${type} with ID: ${id}`);
    // Add approval logic here
  };

  const handleDelete = (type, id) => {
    console.log(`Deleted ${type} with ID: ${id}`);
    // Add deletion logic here
  };

  const menuItems = [
    { text: 'Overview', icon: <DashboardIcon />, key: 'overview' },
    { text: 'User Management', icon: <PeopleIcon />, key: 'users' },
    { text: 'Collector Management', icon: <TruckIcon />, key: 'collectors' },
    { text: 'AI Statistics', icon: <ChartIcon />, key: 'ai-stats' },
  ];

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card className="stat-card">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="h4" component="div" color="primary">
              {systemStats.totalUsers.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card className="stat-card">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Collectors
            </Typography>
            <Typography variant="h4" component="div" color="primary">
              {systemStats.totalCollectors}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card className="stat-card">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Materials Collected
            </Typography>
            <Typography variant="h4" component="div" color="primary">
              {systemStats.materialsCollected.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card className="stat-card">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Weight (kg)
            </Typography>
            <Typography variant="h4" component="div" color="primary">
              {systemStats.totalWeight.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderUserManagement = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pending User Approvals
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Join Date</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      {user.name}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>{user.location}</TableCell>
                  <TableCell>
                    <IconButton
                      color="success"
                      onClick={() => handleApprove('user', user.id)}
                      size="small"
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete('user', user.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderCollectorManagement = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pending Collector Approvals
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Join Date</TableCell>
                <TableCell>Zone</TableCell>
                <TableCell>License</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingCollectors.map((collector) => (
                <TableRow key={collector.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                        <TruckIcon />
                      </Avatar>
                      {collector.name}
                    </Box>
                  </TableCell>
                  <TableCell>{collector.email}</TableCell>
                  <TableCell>{collector.joinDate}</TableCell>
                  <TableCell>{collector.zone}</TableCell>
                  <TableCell>
                    <Chip label={collector.license} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="success"
                      onClick={() => handleApprove('collector', collector.id)}
                      size="small"
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete('collector', collector.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderAIStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Classification Results
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Biodegradable Materials</Typography>
                <Typography color="success.main" fontWeight="bold">
                  {aiClassificationStats.biodegradable}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Non-Biodegradable Materials</Typography>
                <Typography color="warning.main" fontWeight="bold">
                  {aiClassificationStats.nonBiodegradable}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Classification Accuracy</Typography>
                <Typography variant="h6" color="primary.main">
                  {aiClassificationStats.accuracy}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Processing Statistics
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Total materials processed by AI classification system
              </Typography>
              <Typography variant="h4" color="primary.main" sx={{ mt: 1 }}>
                {(aiClassificationStats.biodegradable + aiClassificationStats.nonBiodegradable).toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUserManagement();
      case 'collectors':
        return renderCollectorManagement();
      case 'ai-stats':
        return renderAIStats();
      default:
        return renderOverview();
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: 'primary.main',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            SmartRecycle Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Typography variant="h6" color="primary" fontWeight="bold">
            ⚙️ Admin Panel
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.key} disablePadding>
              <ListItemButton
                selected={activeTab === item.key}
                onClick={() => setActiveTab(item.key)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            {menuItems.find(item => item.key === activeTab)?.text || 'Overview'}
          </Typography>
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 