import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
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
  CircularProgress,
  Alert,
  Paper,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Map as MapIcon,
  SmartToy as ChatbotIcon,
  Nature as EcoIcon,
  Person as PersonIcon,
  Upload as UploadIcon,
  Book as GuideIcon,
} from '@mui/icons-material';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import Confetti from 'react-confetti';
import toast, { Toaster } from 'react-hot-toast';

// --- Import your actual components ---
import DashboardLayout from '../components/DashboardLayout';
import AlertCard from '../components/AlertCard';
import WasteClassifier from '../components/WasteClassifier';
import RecycleRecommendationChatbot from '../components/RecycleRecommendationChatbot';
import WasteGuide from '../components/WasteGuide';
import { supabase } from '../lib/supabaseClient';

// Guide data will be defined inside the component to access translations

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
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));



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
    pickupLatitude: null,
    pickupLongitude: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

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

  // Set window dimensions for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // State for chatbot initial message
  const [chatbotInitialMessage, setChatbotInitialMessage] = useState('');

  // Handle tab and message query parameters
  useEffect(() => {
    const { tab, message, ...otherQuery } = router.query;
    
    if (tab && !isNaN(parseInt(tab))) {
      setActiveTab(parseInt(tab));
    }
    if (message) {
      setChatbotInitialMessage(decodeURIComponent(message));
    }
    
    // Clean the URL after processing the parameters (only if we have tab or message)
    if (tab || message) {
      // Use setTimeout to avoid modifying router during render
      const timer = setTimeout(() => {
        const cleanQuery = Object.keys(otherQuery).length > 0 ? otherQuery : {};
        router.replace({
          pathname: router.pathname,
          query: cleanQuery
        }, undefined, { shallow: true });
      }, 500); // Give a bit more time for state to settle
      
      return () => clearTimeout(timer);
    }
  }, [router.query]);

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

    // Use location coordinates from classification if available, otherwise use placeholder
    const coords = {
      lat: newAlertData.pickupLatitude || 12.9716,
      lng: newAlertData.pickupLongitude || 77.5946
    };

    try {
      const response = await fetch('/api/alerts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAlertData,
          weightEstimate: parseFloat(newAlertData.weightEstimate),
          createdById: user.id,
          pickupLatitude: coords.lat,
          pickupLongitude: coords.lng,
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
          pickupLatitude: null,
          pickupLongitude: null,
        });
        setImageFile(null);
        
        // Trigger celebration effects
        setShowConfetti(true);
        toast.success('🎉 Thanks for being part of building a cleaner city! Your waste alert has been posted successfully.', {
          duration: 6000,
          style: {
            background: '#4CAF50',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '500',
          },
          icon: '🌱',
        });
        
        // Stop confetti after 5 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
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
    // Set the image file from the classification
    if (classificationData.image) {
      setImageFile(classificationData.image);
    }
    
    // Set the location data if available
    if (classificationData.location && classificationData.location.address) {
      setNewAlertData(prev => ({
        ...prev,
        pickupAddress: classificationData.location.address,
        pickupLatitude: classificationData.location.latitude,
        pickupLongitude: classificationData.location.longitude,
        description: `AI classified: ${classificationData.classification.waste_type}. ${classificationData.classification.recycling_instructions || ''}`,
        wasteType: classificationData.classification.biodegradability === 'biodegradable' ? 'ORGANIC' : 'RECYCLABLE'
      }));
    } else {
      setNewAlertData(prev => ({
        ...prev,
        description: `AI classified: ${classificationData.classification.waste_type}. ${classificationData.classification.recycling_instructions || ''}`,
        wasteType: classificationData.classification.biodegradability === 'biodegradable' ? 'ORGANIC' : 'RECYCLABLE'
      }));
    }
    setOpenDialog(true);
  };

  const handlePostAlertFromChat = (wasteDescription) => {
    // 1. Pre-fill the alert form with info from the chat
    setNewAlertData(prev => ({
      ...prev,
      wasteType: 'GENERAL', // Set a default, user can refine
      description: `Alert for: ${wasteDescription}. Please use the AI classifier or provide details below.`,
      // Reset other fields
      weightEstimate: '',
      pickupAddress: '',
      pickupTimeSlot: '',
      pickupLatitude: null,
      pickupLongitude: null,
    }));

    // 2. Switch to the AI Classifier tab
    setActiveTab(1);
    
    // 3. Open the dialog to continue creating the alert
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
    <Box sx={{ minHeight: '100vh', overflowX: 'hidden', position: 'relative', background: '#e9f5ec' }} className="transition-all duration-300 ease-in-out">
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.3}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
        />
      )}
      
      {/* Toast Notifications */}
      <Toaster position="top-center" />
      
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: '#ffffff00' } },
          fpsLimit: 60,
          interactivity: { events: { onHover: { enable: !isMobile, mode: 'repulse' } }, modes: { repulse: { distance: 100 } } },
          particles: {
            color: { value: '#4CAF50' },
            links: { enable: true, color: '#4CAF50', distance: 120 },
            move: { enable: true, speed: 1 },
            size: { value: { min: 1, max: 2.5 } },
            number: { value: isMobile ? 30 : 60 }
          }
        }}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, width: '100%', height: '100%' }}
      />

      <DashboardLayout navItems={userNavItems} pageTitle="User Dashboard">
        <div style={{ opacity: 1, visibility: 'visible' }} className="animate-fade-in">
          <Box sx={{ mb: 4 }}>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              gutterBottom
              sx={{ color: '#4CAF50', fontWeight: 'bold' }}
            >
              Welcome back, {user?.profile?.name || 'User'}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your waste alerts and explore eco-friendly options.
            </Typography>
          </Box>

          <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }} className="animate-fade-in">
            <Grid item xs={6} sm={6} md={3}><StyledPaper sx={{ textAlign: 'center' }} className="hover:shadow-lg transform hover:scale-105 "><Typography color="text.secondary" variant="body2">Total Posts</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{wasteAlerts.length}</Typography></StyledPaper></Grid>
            <Grid item xs={6} sm={6} md={3}><StyledPaper sx={{ textAlign: 'center' }} className="hover:shadow-lg transform hover:scale-105 "><Typography color="text.secondary" variant="body2">Pending</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{wasteAlerts.filter(a => a.status === 'PENDING').length}</Typography></StyledPaper></Grid>
            <Grid item xs={6} sm={6} md={3}><StyledPaper sx={{ textAlign: 'center' }} className="hover:shadow-lg transform hover:scale-105"><Typography color="text.secondary" variant="body2">In Progress</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{wasteAlerts.filter(a => a.status === 'CLAIMED' || a.status === 'IN_TRANSIT').length}</Typography></StyledPaper></Grid>
            <Grid item xs={6} sm={6} md={3}><StyledPaper sx={{ textAlign: 'center' }} className="hover:shadow-lg transform hover:scale-105"><Typography color="text.secondary" variant="body2">Completed</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{wasteAlerts.filter(a => a.status === 'COMPLETED').length}</Typography></StyledPaper></Grid>
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
              <Tab label={isMobile ? '' : t('userDashboard.tabs.alerts')} icon={<EcoIcon />} />
              <Tab label={isMobile ? '' : t('userDashboard.tabs.aiClassifier')} icon={<AnalyticsIcon />} />
              <Tab label={isMobile ? '' : t('userDashboard.tabs.findCollectors')} icon={<MapIcon />} />
              <Tab label={isMobile ? '' : t('userDashboard.tabs.chatbot')} icon={<ChatbotIcon />} />
              <Tab label={isMobile ? '' : t('userDashboard.tabs.wasteGuide')} icon={<GuideIcon />} />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              {loading ? <CircularProgress /> : error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Stack spacing={2}>
                {wasteAlerts.length > 0 ? (
                  wasteAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
                ) : (
                  !loading && <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>{t('userDashboard.noAlertsMessage')}</Typography>
                )}
              </Stack>
            </TabPanel>
            <TabPanel value={activeTab} index={1}><WasteClassifier onClassificationComplete={handleClassificationComplete} /></TabPanel>
            <TabPanel value={activeTab} index={2}><WasteCollectorMapWithNoSSR /></TabPanel>
            <TabPanel value={activeTab} index={3}><RecycleRecommendationChatbot onPostAlertFromChat={handlePostAlertFromChat} initialMessage={chatbotInitialMessage} /></TabPanel>
            <TabPanel value={activeTab} index={4}>
              <WasteGuide />
            </TabPanel>
          </StyledPaper>

          <Fab
            sx={{ position: 'fixed', bottom: 16, right: 16, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }}
            aria-label="Create new alert"
            onClick={() => setOpenDialog(true)}
            className="hover:shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse"
          >
            <AddIcon sx={{ color: 'white' }} />
          </Fab>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: '#2E7D32' }}>Post New Waste Alert</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
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
        </div>
      </DashboardLayout>
    </Box>
  );
}
