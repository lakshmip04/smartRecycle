import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
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
import DashboardLayout from '../components/DashboardLayout';

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

  useEffect(() => {
    // --- Stricter Authentication Check ---
    const storedUserData = localStorage.getItem('user_data');
    if (!storedUserData || JSON.parse(storedUserData).role !== 'ADMIN') {
        // If user is not an admin, show error and redirect
        setError('Access Denied. You must be an admin to view this page.');
        setLoading(false);
        setTimeout(() => router.push('/'), 3000); // Redirect to login after 3 seconds
        return; // Stop further execution
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
    try {
        const response = await fetch(`/api/admin/collectors/${collectorId}/verify`, {
            method: 'PUT',
        });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || 'Failed to approve collector.');
        }
        setCollectors(prev => prev.filter(c => c.id !== collectorId));
        setSnackbar({ open: true, message: 'Collector approved!', severity: 'success' });
    } catch (err) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleDelete = async (type, userId) => {
    if (window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to delete user.');
            }
            if (type === 'user') {
                setUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                setCollectors(prev => prev.filter(c => c.id !== userId));
            }
            setSnackbar({ open: true, message: 'User deleted successfully!', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        }
    }
  };
  
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const renderContent = () => {
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    switch (activeTab) {
      case 'overview':
        return (
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography color="textSecondary">Total Users</Typography><Typography variant="h4">{systemStats.totalUsers?.toLocaleString() || 0}</Typography></CardContent></Card></Grid>
                <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography color="textSecondary">Total Collectors</Typography><Typography variant="h4">{systemStats.totalCollectors?.toLocaleString() || 0}</Typography></CardContent></Card></Grid>
                <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography color="textSecondary">Materials Collected</Typography><Typography variant="h4">{systemStats.materialsCollected?.toLocaleString() || 0}</Typography></CardContent></Card></Grid>
                <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography color="textSecondary">Total Weight (kg)</Typography><Typography variant="h4">{systemStats.totalWeight?.toLocaleString() || 0}</Typography></CardContent></Card></Grid>
            </Grid>
        );
      case 'users':
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>User Management</Typography>
                    <TableContainer component={Paper}>
                    <Table>
                        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Join Date</TableCell><TableCell>Address</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
                        <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.householdProfile?.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{user.householdProfile?.address}</TableCell>
                                <TableCell>
                                    <IconButton color="error" onClick={() => handleDelete('user', user.id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        );
      case 'collectors':
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Pending Collector Approvals</Typography>
                    <TableContainer component={Paper}>
                    <Table>
                        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Join Date</TableCell><TableCell>Address</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
                        <TableBody>
                        {collectors.map((collector) => (
                            <TableRow key={collector.id}>
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
                </CardContent>
            </Card>
        );
      case 'ai-stats':
        return <Typography>AI Statistics will be implemented later.</Typography>;
      default:
        return null;
    }
  };

  const handleTabClick = (tabKey) => {
      setActiveTab(tabKey);
  };

  return (
    <DashboardLayout 
        navItems={adminNavItems.map(item => ({...item, path: undefined, onClick: () => handleTabClick(item.key)}))} 
        pageTitle="Admin Dashboard"
    >
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                {adminNavItems.find(item => item.key === activeTab)?.text || 'Overview'}
            </Typography>
            {renderContent()}
        </Container>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
            </Alert>
        </Snackbar>
    </DashboardLayout>
  );
}
