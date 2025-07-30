import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  Person,
  Search,
  Recycling,
  Science,
  Map as MapIcon,
  Close as RejectIcon,
  BusinessCenter as JobsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

// --- Import your actual components ---
import DashboardLayout from '../components/DashboardLayout';
import WasteTypeBadge from '../components/WasteTypeBadge';
import WasteClassifier from '../components/WasteClassifier';

const WasteCollectorMapWithNoSSR = dynamic(
  () => import('../components/WasteCollectorMap'),
  { ssr: false, loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box> }
);

// --- Reusable Styled Paper from other pages ---
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

const MaterialCard = ({ material, handleClaimMaterial, handleRejectMaterial, claimingId }) => {
  const router = useRouter();
  const handleCardClick = () => {
    router.push(`/alerts/${material.id}`);
  };

  return (
    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
      <CardActionArea onClick={handleCardClick} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <WasteTypeBadge type={material.wasteType} />
            <Chip label={`${material.weightEstimate} kg`} size="small" />
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2, minHeight: '40px' }} noWrap>
            {material.description || 'No description provided.'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} /><Typography variant="body2">{material.pickupAddress}</Typography></Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Person sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} /><Typography variant="body2">{material.createdBy?.householdProfile?.name || 'N/A'}</Typography></Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Schedule sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} /><Typography variant="body2">{new Date(material.createdAt).toLocaleString()}</Typography></Box>
        </CardContent>
      </CardActionArea>
      <Divider />
      <CardActions sx={{ p: 2, display: 'flex', gap: 1 }}>
        <Button variant="outlined" color="error" fullWidth size="small" startIcon={<RejectIcon />} onClick={(e) => { e.stopPropagation(); handleRejectMaterial(material.id); }}>Reject</Button>
        <Button variant="contained" fullWidth size="small" onClick={(e) => { e.stopPropagation(); handleClaimMaterial(material.id); }} disabled={claimingId === material.id} sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }}>
          {claimingId === material.id ? <CircularProgress size={20} color="inherit" /> : 'Claim'}
        </Button>
      </CardActions>
    </Card>
  );
};

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

export default function CollectorDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [claimingId, setClaimingId] = useState(null);
  const [user, setUser] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- Navigation Items for Collector ---
  const collectorNavItems = [
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
    if (parsedUser.role !== 'COLLECTOR') {
      setError('Access Denied: This page is for collectors only.');
      setTimeout(() => router.push('/'), 2000);
      setLoading(false);
      return;
    }
    setUser(parsedUser);
  }, [router]);

  useEffect(() => {
    const fetchAvailableAlerts = async (collectorId) => {
      setLoading(true);
      try {
        const response = await fetch('/api/alerts', { headers: { 'x-user-id': collectorId } });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch available materials.');
        }
        const data = await response.json();
        setMaterials(data.alerts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchAvailableAlerts(user.id);
    }
  }, [user]);

  useEffect(() => {
    let filtered = materials;
    if (filterType !== 'all') {
      filtered = filtered.filter(material => material.wasteType === filterType);
    }
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(material =>
        material.wasteType.toLowerCase().includes(lowercasedTerm) ||
        (material.description && material.description.toLowerCase().includes(lowercasedTerm)) ||
        material.pickupAddress.toLowerCase().includes(lowercasedTerm)
      );
    }
    setFilteredMaterials(filtered);
  }, [materials, filterType, searchTerm]);

  // MODIFIED: Added full working logic
  const handleClaimMaterial = async (alertId) => {
    setClaimingId(alertId);
    try {
        const response = await fetch(`/api/alerts/${alertId}/claim`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collectorId: user.id }),
        });
        const result = await response.json();
        if (response.ok) {
            setMaterials(prev => prev.filter(m => m.id !== alertId));
            setSnackbar({ open: true, message: 'Material claimed successfully!', severity: 'success' });
        } else {
            throw new Error(result.message || 'Failed to claim material.');
        }
    } catch (err) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
        setClaimingId(null);
    }
  };

  // MODIFIED: Added full working logic
  const handleRejectMaterial = async (alertId) => {
    try {
        const response = await fetch(`/api/alerts/${alertId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collectorId: user.id }),
        });
        const result = await response.json();
        if (response.ok) {
            setMaterials(prev => prev.filter(m => m.id !== alertId));
            setSnackbar({ open: true, message: 'Job rejected and hidden.', severity: 'info' });
        } else {
            throw new Error(result.message || 'Failed to reject material.');
        }
    } catch (err) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

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

      <DashboardLayout navItems={collectorNavItems} pageTitle="Collector Dashboard">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <Typography variant="h4" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
              Available Jobs
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Find and claim new waste collection jobs in your area.
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <StyledPaper>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="List View" icon={<Recycling />} iconPosition="start" />
                <Tab label="Map View" icon={<MapIcon />} iconPosition="start" />
                <Tab label="AI Classifier" icon={<Science />} iconPosition="start" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}><TextField fullWidth label="Search materials" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }} /></Grid>
                  <Grid item xs={12} md={3}><FormControl fullWidth><InputLabel>Filter by type</InputLabel><Select value={filterType} label="Filter by type" onChange={(e) => setFilterType(e.target.value)}><MenuItem value="all">All Types</MenuItem><MenuItem value="GENERAL">General</MenuItem><MenuItem value="RECYCLABLE">Recyclable</MenuItem><MenuItem value="E_WASTE">E-Waste</MenuItem><MenuItem value="ORGANIC">Organic</MenuItem><MenuItem value="HAZARDOUS">Hazardous</MenuItem></Select></FormControl></Grid>
                  <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}><Typography variant="body2" color="textSecondary">Found {filteredMaterials.length} jobs</Typography></Grid>
                </Grid>

                {loading ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : (
                  <Grid container spacing={3}>
                    {filteredMaterials.map((material) => (
                      <Grid item xs={12} md={6} lg={4} key={material.id}>
                        <MaterialCard material={material} handleClaimMaterial={handleClaimMaterial} handleRejectMaterial={handleRejectMaterial} claimingId={claimingId} />
                      </Grid>
                    ))}
                    {filteredMaterials.length === 0 && !loading && (
                      <Grid item xs={12}><Box sx={{ textAlign: 'center', py: 8, width: '100%' }}><Typography variant="h6" color="textSecondary">No jobs found matching your criteria.</Typography></Box></Grid>
                    )}
                  </Grid>
                )}
              </TabPanel>

              <TabPanel value={activeTab} index={1}><WasteCollectorMapWithNoSSR /></TabPanel>
              <TabPanel value={activeTab} index={2}><WasteClassifier /></TabPanel>
            </StyledPaper>
          </motion.div>
        </motion.div>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </DashboardLayout>
    </Box>
  );
}
