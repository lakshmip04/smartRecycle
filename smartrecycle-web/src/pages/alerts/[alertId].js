import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Snackbar,
  Divider,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Description,
  Schedule,
  LocationOn,
  Directions,
  Person,
  CheckCircle,
  LocalShipping,
  Nature as EcoIcon,
  SmartToy as ChatbotIcon,
  Book as GuideIcon,
  BusinessCenter as JobsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

// --- Import your existing components ---
import DashboardLayout from '../../components/DashboardLayout'; // Adjusted path for nested route
import WasteTypeBadge from '../../components/WasteTypeBadge'; // Assuming you have this component

// --- A reusable styled Paper component from your other pages ---
const StyledPaper = (props) => (
  <Paper
    elevation={4}
    sx={{
      p: { xs: 2, sm: 3 },
      borderRadius: 4,
      backdropFilter: 'blur(8px)',
      background: 'rgba(255,255,255,0.92)',
      height: '100%',
      ...props.sx,
    }}
    {...props}
  >
    {props.children}
  </Paper>
);

export default function MaterialDetailsPage() {
  const router = useRouter();
  const { alertId } = router.query;

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const [claiming, setClaiming] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- Navigation Items based on user role ---
  const navItems = useMemo(() => {
    if (!user) return [];

    if (user.role === 'COLLECTOR') {
      return [
        { name: 'Available Jobs', path: '/collector-dashboard', icon: <JobsIcon /> },
        { name: 'Collection History', path: '/collector-history', icon: <HistoryIcon /> },
        { name: 'My Profile', path: '/profile', icon: <Person /> },
      ];
    }
    // Default to HOUSEHOLD user
    return [
      { name: 'Dashboard', path: '/user-dashboard', icon: <EcoIcon /> },
      { name: 'My Profile', path: '/profile', icon: <Person /> },
      { name: '3R Chatbot', path: '/chatbot', icon: <ChatbotIcon /> },
      { name: 'Waste Guide', path: '/guide', icon: <GuideIcon /> },
    ];
  }, [user]);

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  useEffect(() => {
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    } else {
      router.push('/'); // Redirect if not logged in
    }

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
  }, [alertId, router]);

  const handleClaimMaterial = async () => {
    if (!material || !user) return;
    
    setClaiming(true);
    try {
      const response = await fetch(`/api/alerts/${material.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectorId: user.id }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to claim material');

      setSnackbar({ 
        open: true, 
        message: 'Job claimed successfully! Redirecting to collection history...', 
        severity: 'success' 
      });

      // Redirect to collection history after a short delay
      setTimeout(() => {
        router.push('/collector-history');
      }, 2000);

    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: err.message, 
        severity: 'error' 
      });
    } finally {
      setClaiming(false);
    }
  };

  const handleGetDirections = () => {
    const { pickupLatitude, pickupLongitude } = material;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pickupLatitude},${pickupLongitude}`;
    window.open(url, '_blank');
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  if (loading || !user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#e9f5ec' }}><CircularProgress /></Box>;
  }

  const isAvailable = material?.status === 'PENDING';

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden', position: 'relative', background: '#e9f5ec' }}>
      <Particles 
        id="tsparticles" 
        init={particlesInit} 
        options={{ 
          background: { color: { value: '#ffffff00' } }, 
          fpsLimit: 60, 
          interactivity: { events: { onHover: { enable: true, mode: 'repulse' } }, modes: { repulse: { distance: 100 } } }, 
          particles: { 
            color: { value: '#4CAF50' }, 
            links: { enable: true, color: '#4CAF50', distance: 150 }, 
            move: { enable: true, speed: 1.5 }, 
            size: { value: { min: 1, max: 3 } }, 
            number: { value: 60 },
            opacity: { value: 0.3, animation: { enable: false } },
            life: { duration: { sync: false, value: 0 } }
          } 
        }} 
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, width: '100%', height: '100%' }} 
      />

      <DashboardLayout navItems={navItems} pageTitle="Job Details">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mb: 2, color: '#2E7D32' }}>
            Back to List
          </Button>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {material && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <StyledPaper sx={{ p: 0, overflow: 'hidden' }}>
                  <Box position="relative">
                    <Box
                      component="img"
                      src={material.imageUrl || `https://placehold.co/800x400/eeeeee/2E7D32?text=${material.wasteType}`}
                      alt={material.wasteType}
                      sx={{ width: '100%', height: '350px', objectFit: 'cover' }}
                    />
                    <Chip
                      icon={isAvailable ? <LocalShipping /> : <CheckCircle />}
                      label={isAvailable ? 'Available for Pickup' : `Status: ${material.status}`}
                      color={isAvailable ? 'primary' : 'success'}
                      sx={{ position: 'absolute', top: 16, right: 16, background: isAvailable ? '#0288D1' : '#2E7D32', color: 'white', fontWeight: 'bold' }}
                    />
                  </Box>
                  <Box p={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <WasteTypeBadge type={material.wasteType} />
                      <Chip label={`${material.weightEstimate} kg`} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#2E7D32' }}>
                      Job Description
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                      {material.description || 'No description provided.'}
                    </Typography>
                  </Box>
                </StyledPaper>
              </Grid>

              <Grid item xs={12} md={5}>
                <Stack spacing={3}>
                  <StyledPaper>
                    <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: '#2E7D32' }}>Pickup Information</Typography>
                    <Box display="flex" alignItems="flex-start" mb={2}><LocationOn sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }} /><Typography variant="body1">{material.pickupAddress}</Typography></Box>
                    <Box display="flex" alignItems="flex-start" mb={2}><Person sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }} /><Typography variant="body1">Posted by {material.createdBy?.profile?.name || 'Unknown User'}</Typography></Box>
                    <Box display="flex" alignItems="flex-start" mb={3}><Schedule sx={{ mr: 2, mt: 0.5, color: 'text.secondary' }} /><Typography variant="body1">Posted on {new Date(material.createdAt).toLocaleString()}</Typography></Box>
                    <Button fullWidth variant="outlined" startIcon={<Directions />} onClick={handleGetDirections} sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}>
                      Get Directions
                    </Button>
                  </StyledPaper>

                  {isAvailable && user?.role === 'COLLECTOR' && (
                    <StyledPaper>
                      <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: '#2E7D32' }}>Actions</Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={claiming ? <CircularProgress size={20} color="inherit" /> : <LocalShipping />}
                        onClick={handleClaimMaterial}
                        disabled={claiming}
                        sx={{ py: 1.5, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }}
                      >
                        {claiming ? 'Claiming...' : 'Claim This Job'}
                      </Button>
                    </StyledPaper>
                  )}
                </Stack>
              </Grid>
            </Grid>
          )}

          <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </motion.div>
      </DashboardLayout>
    </Box>
  );
}
