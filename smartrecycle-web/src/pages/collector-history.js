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
  Tab
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  LocationOn,
  Person,
  LocalShipping,
  ArrowBack
} from '@mui/icons-material';

// This component will display a single claimed job
const CollectionCard = ({ item, handleStatusUpdate }) => {
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
            <CardMedia
                component="img"
                sx={{ height: 140 }}
                image={item.imageUrl || `https://placehold.co/300x200?text=${item.wasteType}`}
                alt={item.wasteType}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" fontSize="1.1rem" fontWeight="bold">{item.wasteType}</Typography>
                    <Chip icon={statusInfo.icon} label={statusInfo.text} color={statusInfo.color} size="small" />
                </Box>
                <Typography variant="body2" color="textSecondary" mb={1}>{item.description}</Typography>
                
                <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="textSecondary">{item.pickupAddress}</Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                    <Person fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="textSecondary">{item.createdBy?.householdProfile?.name}</Typography>
                </Box>
            </CardContent>
            <Box p={2} pt={0}>
                {item.status === 'CLAIMED' && (
                    <Button fullWidth variant="outlined" size="small" onClick={() => handleStatusUpdate(item, 'IN_TRANSIT')}>
                        Start Trip
                    </Button>
                )}
                {item.status === 'IN_TRANSIT' && (
                    <Button fullWidth variant="contained" size="small" onClick={() => handleStatusUpdate(item, 'COMPLETED')}>
                        Mark as Collected
                    </Button>
                )}
            </Box>
        </Card>
    );
};


export default function CollectorHistoryPage() {
  const router = useRouter();
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0 for Active, 1 for Completed

  // Data State
  const [user, setUser] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);

  // Dialog & Snackbar
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, newStatus: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const storedUserData = localStorage.getItem('user_data');
    if (!storedUserData) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUserData);
    setUser(parsedUser);

    const fetchCollections = async (collectorId) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/collectors/${collectorId}/alerts`);
        if (!response.ok) throw new Error('Failed to fetch collections.');
        const data = await response.json();
        setActiveJobs(data.activeAlerts);
        setCompletedJobs(data.completedAlerts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (parsedUser?.id) {
      fetchCollections(parsedUser.id);
    }
  }, [router]);

  const handleStatusUpdate = (item, newStatus) => {
    setConfirmDialog({ open: true, item, newStatus });
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

        // Move the item from active to completed list
        setActiveJobs(prev => prev.filter(job => job.id !== item.id));
        setCompletedJobs(prev => [result.alert, ...prev]);

        setSnackbar({ open: true, message: `Job marked as ${newStatus.toLowerCase()}!`, severity: 'success' });
    } catch (err) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
        setConfirmDialog({ open: false, item: null, newStatus: '' });
    }
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.100', minHeight: '100vh' }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/collector-dashboard')} sx={{ mb: 2 }}>
            Back to Dashboard
        </Button>
        <Typography variant="h4" gutterBottom fontWeight="bold">My Collections</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}><Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}><Typography variant="h4">{activeJobs.length}</Typography><Typography variant="caption">ACTIVE JOBS</Typography></Paper></Grid>
            <Grid item xs={6}><Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}><Typography variant="h4">{completedJobs.length}</Typography><Typography variant="caption">COMPLETED</Typography></Paper></Grid>
        </Grid>

        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
            <Tab label={`Active (${activeJobs.length})`} />
            <Tab label={`Completed (${completedJobs.length})`} />
        </Tabs>

        <Grid container spacing={3}>
            {(activeTab === 0 ? activeJobs : completedJobs).map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <CollectionCard item={item} handleStatusUpdate={handleStatusUpdate} />
                </Grid>
            ))}
        </Grid>

        {(activeTab === 0 && activeJobs.length === 0) && <Typography sx={{ mt: 4, textAlign: 'center' }}>No active jobs. Claim one from the dashboard!</Typography>}
        {(activeTab === 1 && completedJobs.length === 0) && <Typography sx={{ mt: 4, textAlign: 'center' }}>No jobs completed yet.</Typography>}

        <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, item: null })}>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to mark "{confirmDialog.item?.wasteType}" as {confirmDialog.newStatus?.toLowerCase()}?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setConfirmDialog({ open: false, item: null })}>Cancel</Button>
                <Button onClick={confirmStatusUpdate} variant="contained">Confirm</Button>
            </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
    </Box>
  );
}
