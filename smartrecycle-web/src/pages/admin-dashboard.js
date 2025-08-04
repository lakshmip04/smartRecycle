import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Tabs,
  Tab,
  Stack,
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Map as MapIcon,
  SmartToy as ChatbotIcon,
  Nature as EcoIcon,
  Person as PersonIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

// --- Import your actual components ---
import DashboardLayout from '../components/DashboardLayout';
import AlertCard from '../components/AlertCard';
import WasteClassifier from '../components/WasteClassifier';
import RecycleRecommendationChatbot from '../components/RecycleRecommendationChatbot';
import { supabase } from '../lib/supabaseClient';

const WasteCollectorMapWithNoSSR = dynamic(
  () => import('../components/WasteCollectorMap'),
  {
    ssr: false,
    loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress color="primary" /></Box>
  }
);

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

// --- A reusable styled Paper component to match the login/register style ---
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


export default function UserDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [wasteAlerts, setWasteAlerts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newAlertData, setNewAlertData] = useState({
    wasteType: 'GENERAL',
    description: '',
    weightEstimate: '',
    pickupAddress: '',
    pickupTimeSlot: '',
  });
  const [imageFile, setImageFile] = useState(null);

  const userNavItems = [
    { name: 'Dashboard', path: '/user-dashboard', icon: <EcoIcon /> },
    { name: 'My Profile', path: '/profile', icon: <PersonIcon /> },
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

    const fetchAlerts = async (userId) => {
      try {
        const response = await fetch(`/api/users/${userId}/alerts`);
        if (!response.ok) throw new Error('Failed to fetch alerts.');
        const data = await response.json();
        setWasteAlerts(data.alerts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (parsedUser?.id) fetchAlerts(parsedUser.id);
    else setLoading(false);
  }, [router]);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlertData.wasteType || !newAlertData.weightEstimate || !newAlertData.pickupAddress || !newAlertData.pickupTimeSlot) {
      setError('Please fill all required fields in the form.');
      return;
    }
    setError('');
    setLoading(true);

    let imageUrl = '';
    if (imageFile) {
      try {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        let { error: uploadError } = await supabase.storage
          .from('waste-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('waste-images').getPublicUrl(filePath);
        if (!data.publicUrl) throw new Error("Could not get public URL for the image.");

        imageUrl = data.publicUrl;
      } catch (uploadError) {
        setError(`Image Upload Failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }
    }

    const placeholderCoords = { lat: 12.9716, lng: 77.5946 };

    try {
      const response = await fetch('/api/alerts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAlertData,
          weightEstimate: parseFloat(newAlertData.weightEstimate),
          createdById: user.id,
          pickupLatitude: placeholderCoords.lat,
          pickupLongitude: placeholderCoords.lng,
          imageUrl: imageUrl,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setWasteAlerts([result.alert, ...wasteAlerts]);
        setOpenDialog(false);
        setNewAlertData({
          wasteType: 'GENERAL',
          description: '',
          weightEstimate: '',
          pickupAddress: '',
          pickupTimeSlot: '',
        });
        setImageFile(null);
      } else {
        setError(result.message || 'Failed to create alert.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleClassificationComplete = (classificationData) => {
    setNewAlertData(prev => ({
      ...prev,
      description: `AI classified: ${classificationData.classification.waste_type}. ${classificationData.classification.recycling_instructions || ''}`,
      wasteType: classificationData.classification.biodegradability === 'biodegradable' ? 'ORGANIC' : 'RECYCLABLE'
    }));
    setOpenDialog(true);
  };

  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#e9f5ec' }}>
        <CircularProgress />
      </Box>
    );
  }

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
            number: { value: 60 }
          }
        }}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, width: '100%', height: '100%' }}
      />

      <DashboardLayout navItems={userNavItems} pageTitle="User Dashboard">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ mb: 4 }}>
            {/* MODIFIED: Added responsive font size to the main title */}
            <Typography variant="h4" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold', fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' } }}>
              Welcome back, {user?.profile?.name || 'User'}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your waste alerts and explore eco-friendly options.
            </Typography>
          </Box>

          {/* This Grid is already responsive because of the xs, sm, and md props */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}><StyledPaper><Typography color="text.secondary">Total Posts</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{wasteAlerts.length}</Typography></StyledPaper></Grid>
            <Grid item xs={12} sm={6} md={3}><StyledPaper><Typography color="text.secondary">Pending</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{wasteAlerts.filter(a => a.status === 'PENDING').length}</Typography></StyledPaper></Grid>
            <Grid item xs={12} sm={6} md={3}><StyledPaper><Typography color="text.secondary">In Progress</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{wasteAlerts.filter(a => a.status === 'CLAIMED' || a.status === 'IN_TRANSIT').length}</Typography></StyledPaper></Grid>
            <Grid item xs={12} sm={6} md={3}><StyledPaper><Typography color="text.secondary">Completed</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{wasteAlerts.filter(a => a.status === 'COMPLETED').length}</Typography></StyledPaper></Grid>
          </Grid>

          <StyledPaper>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="My Waste Alerts" icon={<EcoIcon />} iconPosition="start" />
              <Tab label="AI Waste Classifier" icon={<AnalyticsIcon />} iconPosition="start" />
              <Tab label="Find Collectors" icon={<MapIcon />} iconPosition="start" />
              <Tab label="3R Chatbot" icon={<ChatbotIcon />} iconPosition="start" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              {loading ? <CircularProgress /> : error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Stack spacing={2}>
                {wasteAlerts.length > 0 ? (
                  wasteAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
                ) : (
                  !loading && <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>No waste alerts posted yet. Click the '+' button to create one!</Typography>
                )}
              </Stack>
            </TabPanel>
            <TabPanel value={activeTab} index={1}><WasteClassifier onClassificationComplete={handleClassificationComplete} /></TabPanel>
            <TabPanel value={activeTab} index={2}><WasteCollectorMapWithNoSSR /></TabPanel>
            <TabPanel value={activeTab} index={3}><RecycleRecommendationChatbot /></TabPanel>
          </StyledPaper>

          <Fab sx={{ position: 'fixed', bottom: 32, right: 32, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }} aria-label="Create new alert" onClick={() => setOpenDialog(true)}>
            <AddIcon sx={{ color: 'white' }} />
          </Fab>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: '#2E7D32' }}>Post New Waste Alert</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* MODIFIED: The Grid items now stack on mobile and go side-by-side on larger screens */}
                <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Waste Type</InputLabel><Select value={newAlertData.wasteType} onChange={(e) => setNewAlertData({ ...newAlertData, wasteType: e.target.value })} label="Waste Type"><MenuItem value="GENERAL">General</MenuItem><MenuItem value="RECYCLABLE">Recyclable</MenuItem><MenuItem value="E_WASTE">E-Waste</MenuItem><MenuItem value="ORGANIC">Organic</MenuItem><MenuItem value="HAZARDOUS">Hazardous</MenuItem></Select></FormControl></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Estimated Weight (kg)" type="number" value={newAlertData.weightEstimate} onChange={(e) => setNewAlertData({ ...newAlertData, weightEstimate: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Pickup Address" value={newAlertData.pickupAddress} onChange={(e) => setNewAlertData({ ...newAlertData, pickupAddress: e.target.value })} /></Grid>
                <Grid item xs={12}><FormControl fullWidth><InputLabel>Preferred Pickup Time Slot</InputLabel><Select value={newAlertData.pickupTimeSlot} onChange={(e) => setNewAlertData({ ...newAlertData, pickupTimeSlot: e.target.value })} label="Preferred Pickup Time Slot"><MenuItem value="9am-12pm">Morning (9 AM - 12 PM)</MenuItem><MenuItem value="12pm-3pm">Afternoon (12 PM - 3 PM)</MenuItem><MenuItem value="3pm-6pm">Evening (3 PM - 6 PM)</MenuItem></Select></FormControl></Grid>
                <Grid item xs={12}><TextField fullWidth label="Description (optional)" multiline rows={3} value={newAlertData.description} onChange={(e) => setNewAlertData({ ...newAlertData, description: e.target.value })} /></Grid>
                <Grid item xs={12}><Button variant="outlined" component="label" fullWidth startIcon={<UploadIcon />}>{imageFile ? `Selected: ${imageFile.name}` : 'Upload Image (Optional)'}<input type="file" hidden onChange={handleFileChange} accept="image/*" /></Button></Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateAlert} variant="contained" disabled={loading} sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }}>{loading ? <CircularProgress size={24} /> : 'Create Alert'}</Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </DashboardLayout>
    </Box>
  );
}
