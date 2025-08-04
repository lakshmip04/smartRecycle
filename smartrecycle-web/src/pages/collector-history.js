import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  LocationOn,
  Person,
  LocalShipping,
  ArrowBack,
  BusinessCenter as JobsIcon,
  History as HistoryIcon,
  RestoreFromTrash as UnrejectIcon,
  Directions as DirectionsIcon,
  Route as RouteIcon, // Added for optimize button
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import DashboardLayout from '../components/DashboardLayout';

const CollectionCard = ({ item, handleStatusUpdate, handleGetDirections }) => {
    const getStatusInfo = (status) => {
        switch (status) {
            case 'CLAIMED': return { text: 'Claimed', color: 'info', icon: <Schedule /> };
            case 'IN_TRANSIT': return { text: 'In Transit', color: 'warning', icon: <LocalShipping /> };
            case 'COMPLETED': return { text: 'Completed', color: 'success', icon: <CheckCircle /> };
            case 'CANCELLED': return { text: 'Cancelled', color: 'error', icon: <CheckCircle /> };
            default: return { text: status, color: 'default' };
        }
    };
    const statusInfo = getStatusInfo(item.status);

    return (
        <Card elevation={2} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardMedia component="img" sx={{ height: 140 }} image={item.imageUrl || `https://placehold.co/300x200?text=${item.wasteType}`} alt={item.wasteType} />
            <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}><Typography variant="h6" fontSize="1.1rem" fontWeight="bold">{item.wasteType}</Typography><Chip icon={statusInfo.icon} label={statusInfo.text} color={statusInfo.color} size="small" /></Box>
                <Typography variant="body2" color="textSecondary" mb={1}>{item.description}</Typography>
                
                <Box display="flex" alignItems="center" mb={1}><LocationOn fontSize="small" color="action" sx={{ mr: 1 }} /><Typography variant="caption" color="textSecondary">{item.pickupAddress}</Typography></Box>
                <Box display="flex" alignItems="center" mb={1}><Person fontSize="small" color="action" sx={{ mr: 1 }} /><Typography variant="caption" color="textSecondary">{item.createdBy?.householdProfile?.name}</Typography></Box>
            </CardContent>
            <Box p={2} pt={0}>
                {item.status === 'CLAIMED' && <Button fullWidth variant="outlined" size="small" onClick={() => handleStatusUpdate(item, 'IN_TRANSIT')}>Start Trip</Button>}
                {item.status === 'IN_TRANSIT' && (
                    <Box display="flex" gap={1}>
                        <Button fullWidth variant="outlined" size="small" startIcon={<DirectionsIcon />} onClick={() => handleGetDirections(item)}>Get Directions</Button>
                        <Button fullWidth variant="contained" size="small" onClick={() => handleStatusUpdate(item, 'COMPLETED')}>Collected</Button>
                    </Box>
                )}
            </Box>
        </Card>
    );
};

const RejectedCard = ({ item, handleUnreject }) => (
    <Card elevation={2} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <CardMedia component="img" sx={{ height: 140 }} image={item.imageUrl || `https://placehold.co/300x200?text=${item.wasteType}`} alt={item.wasteType} />
        <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontSize="1.1rem" fontWeight="bold">{item.wasteType}</Typography>
            <Typography variant="body2" color="textSecondary" mb={1}>{item.description}</Typography>
        </CardContent>
        <Divider />
        <CardActions sx={{ p: 2 }}>
            <Button fullWidth variant="contained" size="small" startIcon={<UnrejectIcon />} onClick={() => handleUnreject(item.id)}>Move to Available</Button>
        </CardActions>
    </Card>
);

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

export default function CollectorHistoryPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [rejectedJobs, setRejectedJobs] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, newStatus: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [optimizing, setOptimizing] = useState(false); // ADDED: State for optimization loading
  const [optimizedRoutes, setOptimizedRoutes] = useState(null); // ADDED: State to store the optimized routes

  const navItems = [
    { name: 'Available Jobs', path: '/collector-dashboard', icon: <JobsIcon /> },
    { name: 'Collection History', path: '/collector-history', icon: <HistoryIcon /> },
    { name: 'My Profile', path: '/profile', icon: <Person /> },
  ];

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  useEffect(() => {
    const storedUserData = localStorage.getItem('user_data');
    if (!storedUserData) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUserData);
    setUser(parsedUser);

    const fetchAllData = async (collectorId) => {
      setLoading(true);
      try {
        const [collectionsRes, rejectedRes] = await Promise.all([
            fetch(`/api/collectors/${collectorId}/alerts`),
            fetch(`/api/collectors/${collectorId}/rejected-alerts`)
        ]);
        if (!collectionsRes.ok || !rejectedRes.ok) throw new Error('Failed to fetch data.');
        
        const collectionsData = await collectionsRes.json();
        const rejectedData = await rejectedRes.json();

        setActiveJobs(collectionsData.activeAlerts);
        setCompletedJobs(collectionsData.completedAlerts);
        setRejectedJobs(rejectedData.rejectedAlerts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (parsedUser?.id) {
      fetchAllData(parsedUser.id);
    }
  }, [router]);

  const handleStatusUpdate = (item, newStatus) => {
    setConfirmDialog({ open: true, item, newStatus });
  };

  const handleGetDirections = (item) => {
    const { pickupLatitude, pickupLongitude } = item;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pickupLatitude},${pickupLongitude}`;
    window.open(url, '_blank');
  };

  const confirmStatusUpdate = async () => {
    const { item, newStatus } = confirmDialog;
    try {
        const response = await fetch(`/api/alerts/${item.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, collectorId: user.id }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        if (newStatus === 'IN_TRANSIT') {
            setActiveJobs(prev => prev.map(job => job.id === item.id ? result.alert : job));
            setSnackbar({ open: true, message: 'Trip started! Opening directions...', severity: 'success' });
            handleGetDirections(result.alert);
        } else if (newStatus === 'COMPLETED') {
            setActiveJobs(prev => prev.filter(job => job.id !== item.id));
            setCompletedJobs(prev => [result.alert, ...prev]);
            setSnackbar({ open: true, message: `Job marked as completed!`, severity: 'success' });
        }
    } catch (err) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
        setConfirmDialog({ open: false, item: null, newStatus: '' });
    }
  };

  const handleUnreject = async (alertId) => {
    // ... unreject logic ...
  };

  // ADDED: Function to handle route optimization
  const handleOptimizeRoute = async () => {
    setOptimizing(true);
    setError('');
    try {
        const alertIds = activeJobs.map(job => job.id);
        if (alertIds.length === 0) {
            throw new Error("No active jobs to optimize.");
        }

        const response = await fetch(`/api/collectors/${user.id}/optimize-route`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alertIds }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        setOptimizedRoutes(result.optimizedRoutes);
        setSnackbar({ open: true, message: 'Route optimized successfully!', severity: 'success' });
    } catch (err) {
        setError(err.message);
    } finally {
        setOptimizing(false);
    }
  };

  // ADDED: Function to open the optimized route in Google Maps
  const handleViewRouteOnMap = (routeGroup) => {
    const collectorLocation = `${user.profile.latitude},${user.profile.longitude}`;
    const waypoints = routeGroup.map(alert => `${alert.pickupLatitude},${alert.pickupLongitude}`).join('|');
    const url = `https://www.google.com/maps/dir/?api=1&origin=${collectorLocation}&destination=${collectorLocation}&waypoints=${waypoints}`;
    window.open(url, '_blank');
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden', position: 'relative', background: '#e9f5ec' }}>
      <Particles id="tsparticles" init={particlesInit} options={{ background: { color: { value: '#ffffff00' } }, fpsLimit: 60, interactivity: { events: { onHover: { enable: true, mode: 'repulse' } }, modes: { repulse: { distance: 100 } } }, particles: { color: { value: '#4CAF50' }, links: { enable: true, color: '#4CAF50', distance: 150 }, move: { enable: true, speed: 1.5 }, size: { value: { min: 1, max: 3 } }, number: { value: 60 }, opacity: { value: 0.3 } } }} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, width: '100%', height: '100%' }} />
      <DashboardLayout navItems={navItems} pageTitle="Collection History">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold', mb: 3 }}>My Collections</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
            <Tab label={`Active (${activeJobs.length})`} />
            <Tab label={`Completed (${completedJobs.length})`} />
            <Tab label={`Rejected (${rejectedJobs.length})`} />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            {/* ADDED: Optimize Route Button and Display */}
            <Box sx={{ mb: 3 }}>
                <Button 
                    variant="contained" 
                    startIcon={optimizing ? <CircularProgress size={20} color="inherit" /> : <RouteIcon />}
                    onClick={handleOptimizeRoute}
                    disabled={optimizing || activeJobs.length === 0}
                >
                    Optimize Today's Route
                </Button>
            </Box>
            {optimizedRoutes && (
                <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Optimized Schedule</Typography>
                    {Object.entries(optimizedRoutes).map(([timeSlot, routeGroup]) => (
                        <Box key={timeSlot} sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">{timeSlot}</Typography>
                            <List dense>
                                {routeGroup.map((alert, index) => (
                                    <ListItem key={alert.id}>
                                        <ListItemText primary={`${index + 1}. ${alert.pickupAddress}`} secondary={`Waste: ${alert.wasteType}, Weight: ${alert.weightEstimate}kg`} />
                                    </ListItem>
                                ))}
                            </List>
                            <Button variant="outlined" startIcon={<DirectionsIcon />} onClick={() => handleViewRouteOnMap(routeGroup)}>
                                View {timeSlot} Route on Map
                            </Button>
                            <Divider sx={{ my: 2 }} />
                        </Box>
                    ))}
                </Paper>
            )}
            <Grid container spacing={3}>
                {activeJobs.map((item) => <Grid item xs={12} sm={6} md={4} key={item.id}><CollectionCard item={item} handleStatusUpdate={handleStatusUpdate} handleGetDirections={handleGetDirections} /></Grid>)}
                {activeJobs.length === 0 && <Typography sx={{ mt: 4, textAlign: 'center', width: '100%' }}>No active jobs.</Typography>}
            </Grid>
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
                {completedJobs.map((item) => <Grid item xs={12} sm={6} md={4} key={item.id}><CollectionCard item={item} handleStatusUpdate={handleStatusUpdate} handleGetDirections={handleGetDirections} /></Grid>)}
                {completedJobs.length === 0 && <Typography sx={{ mt: 4, textAlign: 'center', width: '100%' }}>No jobs completed yet.</Typography>}
            </Grid>
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
                {rejectedJobs.map((item) => <Grid item xs={12} sm={6} md={4} key={item.id}><RejectedCard item={item} handleUnreject={handleUnreject} /></Grid>)}
                {rejectedJobs.length === 0 && <Typography sx={{ mt: 4, textAlign: 'center', width: '100%' }}>You have not rejected any jobs.</Typography>}
            </Grid>
          </TabPanel>

          <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, item: null })}>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogContent><Typography>Are you sure you want to mark "{confirmDialog.item?.wasteType}" as {confirmDialog.newStatus?.toLowerCase()}?</Typography></DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmDialog({ open: false, item: null })}>Cancel</Button>
              <Button onClick={confirmStatusUpdate} variant="contained">Confirm</Button>
            </DialogActions>
          </Dialog>

          <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
          </Snackbar>
        </motion.div>
      </DashboardLayout>
    </Box>
  );
}
