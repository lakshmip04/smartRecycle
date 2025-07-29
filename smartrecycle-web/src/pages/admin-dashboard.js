import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Grid,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalShipping as TruckIcon,
  BarChart as ChartIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

// --- Import your DashboardLayout component ---
import DashboardLayout from '../components/DashboardLayout';

// --- A reusable styled Paper component to match the theme ---
const StyledPaper = (props) => (
  <Paper
    elevation={4}
    sx={{
      p: { xs: 2, sm: 3 },
      borderRadius: 4,
      backdropFilter: 'blur(8px)',
      background: 'rgba(255,255,255,0.92)',
      ...props.sx,
    }}
    {...props}
  >
    {props.children}
  </Paper>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [systemStats, setSystemStats] = useState({});
  const [users, setUsers] = useState([]);
  const [collectors, setCollectors] = useState([]);

  const adminNavItems = [
    { name: 'Overview', key: 'overview', icon: <DashboardIcon /> },
    { name: 'User Management', key: 'users', icon: <PeopleIcon /> },
    { name: 'Collector Management', key: 'collectors', icon: <TruckIcon /> },
    { name: 'AI Statistics', key: 'ai-stats', icon: <ChartIcon /> },
  ];

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  useEffect(() => {
    const storedUserData = localStorage.getItem('user_data');
    if (!storedUserData || JSON.parse(storedUserData).role !== 'ADMIN') {
      setError('Access Denied. You must be an admin to view this page.');
      setLoading(false);
      setTimeout(() => router.push('/'), 3000);
      return;
    }

    const fetchData = async () => {
      setError('');
      try {
        const [statsRes, usersRes, collectorsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/users'),
          fetch('/api/admin/collectors'),
        ]);

        if (!statsRes.ok || !usersRes.ok || !collectorsRes.ok) {
          throw new Error('Failed to fetch admin data.');
        }

        const statsData = await statsRes.json();
        const usersData = await usersRes.json();
        const collectorsData = await collectorsRes.json();

        setSystemStats(statsData);
        setUsers(usersData);
        setCollectors(collectorsData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleApprove = async (collectorId) => {
    // ... (Your existing handleApprove logic remains unchanged)
  };

  const handleDelete = async (type, userId) => {
    // ... (Your existing handleDelete logic remains unchanged)
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const renderContent = () => {
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    switch (activeTab) {
      case 'overview':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}><StyledPaper><Typography color="textSecondary">Total Users</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{systemStats.totalUsers?.toLocaleString() || 0}</Typography></StyledPaper></Grid>
            <Grid item xs={12} sm={6} md={3}><StyledPaper><Typography color="textSecondary">Total Collectors</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{systemStats.totalCollectors?.toLocaleString() || 0}</Typography></StyledPaper></Grid>
            <Grid item xs={12} sm={6} md={3}><StyledPaper><Typography color="textSecondary">Materials Collected</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{systemStats.materialsCollected?.toLocaleString() || 0}</Typography></StyledPaper></Grid>
            <Grid item xs={12} sm={6} md={3}><StyledPaper><Typography color="textSecondary">Total Weight (kg)</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{systemStats.totalWeight?.toLocaleString() || 0}</Typography></StyledPaper></Grid>
          </Grid>
        );
      case 'users':
        return (
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>User Management</Typography>
            <TableContainer>
              <Table>
                <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Join Date</TableCell><TableCell>Address</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.householdProfile?.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{user.householdProfile?.address}</TableCell>
                      <TableCell><IconButton color="error" onClick={() => handleDelete('user', user.id)}><DeleteIcon /></IconButton></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </StyledPaper>
        );
      case 'collectors':
        return (
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>Pending Collector Approvals</Typography>
            <TableContainer>
              <Table>
                <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Join Date</TableCell><TableCell>Address</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
                <TableBody>
                  {collectors.map((collector) => (
                    <TableRow key={collector.id} hover>
                      <TableCell>{collector.collectorProfile?.name}</TableCell>
                      <TableCell>{collector.email}</TableCell>
                      <TableCell>{new Date(collector.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{collector.collectorProfile?.address}</TableCell>
                      <TableCell>
                        <IconButton color="success" onClick={() => handleApprove(collector.id)}><CheckIcon /></IconButton>
                        <IconButton color="error" onClick={() => handleDelete('collector', collector.id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </StyledPaper>
        );
      case 'ai-stats':
        return <StyledPaper><Typography>AI Statistics will be implemented later.</Typography></StyledPaper>;
      default:
        return null;
    }
  };

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
  };

  const pageTitle = adminNavItems.find(item => item.key === activeTab)?.name || 'Admin Dashboard';

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden', position: 'relative', background: '#e9f5ec' }}>
      <Particles id="tsparticles" init={particlesInit} options={{ background: { color: { value: '#ffffff00' } }, fpsLimit: 60, interactivity: { events: { onHover: { enable: true, mode: 'repulse' } }, modes: { repulse: { distance: 100 } } }, particles: { color: { value: '#4CAF50' }, links: { enable: true, color: '#4CAF50', distance: 150 }, move: { enable: true, speed: 1.5 }, size: { value: { min: 1, max: 3 } }, number: { value: 60 } } }} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, width: '100%', height: '100%' }} />

      <DashboardLayout
        navItems={adminNavItems.map(item => ({ ...item, path: undefined, onClick: () => handleTabClick(item.key) }))}
        pageTitle={pageTitle}
      >
        <motion.div
          key={activeTab} // Animate when tab changes
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
            {pageTitle}
          </Typography>
          {renderContent()}
        </motion.div>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DashboardLayout>
    </Box>
  );
}
