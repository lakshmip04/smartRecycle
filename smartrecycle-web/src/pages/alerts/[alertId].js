import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Button,
  Chip,
  Grid,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Container,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  Description,
  Inventory,
  Schedule,
  LocationOn,
  Directions,
  Person,
  CheckCircle,
  LocalShipping,
} from '@mui/icons-material';

export default function MaterialDetailsPage() {
  const router = useRouter();
  const { alertId } = router.query; // Get the alert ID from the URL

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  const [claiming, setClaiming] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Get logged-in user from localStorage
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }

    // Fetch the specific alert details when the alertId is available
    if (alertId) {
      const fetchMaterialDetails = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/alerts/${alertId}`);
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Material not found');
          }
          const data = await response.json();
          setMaterial(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchMaterialDetails();
    }
  }, [alertId]); // Re-run when alertId changes

  const handleClaimMaterial = async () => {
    if (!user || user.role !== 'COLLECTOR') {
        setSnackbar({ open: true, message: 'Only collectors can claim materials.', severity: 'error' });
        return;
    }
    setClaiming(true);
    try {
        const response = await fetch(`/api/alerts/${alertId}/claim`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collectorId: user.id }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        setSnackbar({ open: true, message: 'Material claimed successfully! Redirecting...', severity: 'success' });
        // Redirect to the collector's claimed jobs page
        setTimeout(() => router.push('/collector-history'), 1500);

    } catch (err) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
        setClaiming(false);
    }
  };

  const handleGetDirections = () => {
    const { pickupLatitude, pickupLongitude } = material;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pickupLatitude},${pickupLongitude}`;
    window.open(url, '_blank');
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  if (!material) {
    return null; // Or a "not found" component
  }

  const isAvailable = material.status === 'PENDING';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mb: 2 }}>
        Back
      </Button>

      <Card sx={{ mb: 3 }}>
        <Box position="relative">
          <CardMedia
            component="img"
            height="350"
            image={material.imageUrl || `https://placehold.co/600x350?text=${material.wasteType}`}
            alt={material.wasteType}
          />
          <Chip
            icon={isAvailable ? <LocalShipping /> : <CheckCircle />}
            label={isAvailable ? 'Available' : `Status: ${material.status}`}
            color={isAvailable ? 'primary' : 'success'}
            sx={{ position: 'absolute', top: 16, right: 16, color: 'white', fontWeight: 'bold' }}
          />
        </Box>
      </Card>

      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Typography variant="h4" fontWeight="bold">{material.wasteType}</Typography>
        <Chip label={`${material.weightEstimate} kg`} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Details</Typography>
            <Box display="flex" alignItems="flex-start" mb={2}>
              <Description sx={{ mr: 2, color: 'text.secondary' }} />
              <Typography variant="body2">{material.description || 'No description provided.'}</Typography>
            </Box>
            <Box display="flex" alignItems="flex-start">
              <Schedule sx={{ mr: 2, color: 'text.secondary' }} />
              <Typography variant="body2">Posted on {new Date(material.createdAt).toLocaleString()}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Pickup Information</Typography>
            <Box display="flex" alignItems="flex-start" mb={2}>
              <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="body2">{material.pickupAddress}</Typography>
            </Box>
            <Box display="flex" alignItems="flex-start" mb={2}>
              <Person sx={{ mr: 2, color: 'text.secondary' }} />
              <Typography variant="body2">Posted by {material.createdBy?.householdProfile?.name || 'Unknown User'}</Typography>
            </Box>
            <Button fullWidth variant="outlined" startIcon={<Directions />} onClick={handleGetDirections}>
              Get Directions
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {isAvailable && (
        <Paper elevation={3} sx={{ p: 2, mt: 3, textAlign: 'center' }}>
            <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={claiming ? <CircularProgress size={20} color="inherit" /> : <LocalShipping />}
                onClick={handleClaimMaterial}
                disabled={claiming}
            >
                {claiming ? 'Claiming...' : 'Claim This Material'}
            </Button>
        </Paper>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
