import React, { useState, useEffect, useMemo } from 'react';
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
  MonetizationOn as IncentiveIcon, // Added for incentive display
} from '@mui/icons-material';
import { motion } from 'framer-motion';
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
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));



  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [wasteAlerts, setWasteAlerts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newAlertData, setNewAlertData] = useState({
<<<<<<< HEAD
    wasteType: '',
=======
    wasteType: 'PLASTIC',
>>>>>>> 2afac7eda8a727842d25a5ce142ac1be43f1892e
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
  const [incentives, setIncentives] = useState([]); // ADDED: State to store incentive prices

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

    const fetchInitialData = async (userId) => {
      try {
        // Fetch both alerts and incentives at the same time
        const [alertsRes, incentivesRes] = await Promise.all([
          fetch(`/api/users/${userId}/alerts`),
          fetch('/api/admin/incentives') // Fetch incentive prices
        ]);

        if (!alertsRes.ok) throw new Error('Failed to fetch alerts.');
        if (!incentivesRes.ok) throw new Error('Failed to fetch incentives.');

        const alertsData = await alertsRes.json();
        const incentivesData = await incentivesRes.json();
        
        setWasteAlerts(alertsData.alerts);
        setIncentives(incentivesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (parsedUser?.id) fetchInitialData(parsedUser.id);
    else setLoading(false);
  }, [router]);

  // ADDED: Calculate estimated incentive in real-time
  const estimatedIncentive = useMemo(() => {
    if (!newAlertData.wasteType || !newAlertData.weightEstimate) {
      return '0.00';
    }
    const incentiveRate = incentives.find(i => i.wasteType === newAlertData.wasteType);
    if (!incentiveRate) {
      return '0.00';
    }
    return (parseFloat(newAlertData.weightEstimate) * incentiveRate.pricePerKg).toFixed(2);
  }, [newAlertData.wasteType, newAlertData.weightEstimate, incentives]);

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
<<<<<<< HEAD
          wasteType: '',
=======
          wasteType: 'PLASTIC',
>>>>>>> 2afac7eda8a727842d25a5ce142ac1be43f1892e
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
    
    // Use the mapped system waste type if available, otherwise fallback to biodegradability logic
    const mappedWasteType = classificationData.classification.system_waste_type || 
      (classificationData.classification.biodegradability === 'biodegradable' ? 'ORGANIC' : 'RECYCLABLE');
    
    console.log("🎯 Using mapped waste type:", mappedWasteType);
    
    // Set the location data if available
    if (classificationData.location && classificationData.location.address) {
      setNewAlertData(prev => ({
        ...prev,
        pickupAddress: classificationData.location.address,
        pickupLatitude: classificationData.location.latitude,
        pickupLongitude: classificationData.location.longitude,
        description: `AI classified: ${classificationData.classification.waste_type}. ${classificationData.classification.recycling_instructions || ''}`,
        wasteType: mappedWasteType
      }));
    } else {
      setNewAlertData(prev => ({
        ...prev,
        description: `AI classified: ${classificationData.classification.waste_type}. ${classificationData.classification.recycling_instructions || ''}`,
        wasteType: mappedWasteType
      }));
    }
    setOpenDialog(true);
  };

  const handlePostAlertFromChat = (wasteDescription) => {
    // 1. Pre-fill the alert form with info from the chat
    setNewAlertData(prev => ({
      ...prev,
<<<<<<< HEAD
      wasteType: '', // Set a default, user can refine
=======
      wasteType: 'PLASTIC', // Set a default, user can refine
>>>>>>> 2afac7eda8a727842d25a5ce142ac1be43f1892e
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
              {t('userDashboard.welcomeMessage', { name: user?.profile?.name || 'User' })}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('userDashboard.welcomeDescription')}
            </Typography>
          </Box>

          <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 4 }} className="animate-fade-in">
            <Grid item xs={12} sm={6} md={3}><StyledPaper sx={{ textAlign: 'center' }} className="hover:shadow-lg transform hover:scale-105 "><Typography color="text.secondary" variant="body2">{t('userDashboard.stats.totalPosts')}</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{wasteAlerts.length}</Typography></StyledPaper></Grid>
            <Grid item xs={12} sm={6} md={3}><StyledPaper sx={{ textAlign: 'center' }} className="hover:shadow-lg transform hover:scale-105 "><Typography color="text.secondary" variant="body2">{t('userDashboard.stats.pending')}</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{wasteAlerts.filter(a => a.status === 'PENDING').length}</Typography></StyledPaper></Grid>
            <Grid item xs={12} sm={6} md={3}><StyledPaper sx={{ textAlign: 'center' }} className="hover:shadow-lg transform hover:scale-105"><Typography color="text.secondary" variant="body2">{t('userDashboard.stats.inProgress')}</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{wasteAlerts.filter(a => a.status === 'CLAIMED' || a.status === 'IN_TRANSIT').length}</Typography></StyledPaper></Grid>
            <Grid item xs={12} sm={6} md={3}><StyledPaper sx={{ textAlign: 'center' }} className="hover:shadow-lg transform hover:scale-105"><Typography color="text.secondary" variant="body2">{t('userDashboard.stats.completed')}</Typography><Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 600 }}>{wasteAlerts.filter(a => a.status === 'COMPLETED').length}</Typography></StyledPaper></Grid>
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
            <DialogTitle sx={{ color: '#2E7D32' }}>{t('userDashboard.postAlert.title')}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
<<<<<<< HEAD
                <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Waste Type</InputLabel>
                <Select value={newAlertData.wasteType} onChange={(e) => setNewAlertData({ ...newAlertData, wasteType: e.target.value })} label="Waste Type"><MenuItem value="ORGANIC">Organic</MenuItem>
                    <MenuItem value="PLASTIC">Plastic</MenuItem>
                    <MenuItem value="PAPER">Paper</MenuItem>
                    <MenuItem value="METAL">Metal</MenuItem>
                    <MenuItem value="GLASS">Glass</MenuItem>
                    <MenuItem value="E_WASTE">E-Waste</MenuItem>
                    <MenuItem value="BULBS_LIGHTING">Bulbs/Lighting</MenuItem>
                    <MenuItem value="CONSTRUCTION_DEBRIS">Construction Debris</MenuItem>
                    <MenuItem value="SANITARY_WASTE">Sanitary Waste</MenuItem>
                    <MenuItem value="MEDICAL">Medical</MenuItem>
                    <MenuItem value="GENERAL">Other Dry Waste (General)</MenuItem>
                    </Select></FormControl></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Estimated Weight (kg)" type="number" value={newAlertData.weightEstimate} onChange={(e) => setNewAlertData({ ...newAlertData, weightEstimate: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Pickup Address" value={newAlertData.pickupAddress} onChange={(e) => setNewAlertData({ ...newAlertData, pickupAddress: e.target.value })} /></Grid>
                <Grid item xs={12}><FormControl fullWidth><InputLabel>Preferred Pickup Time Slot</InputLabel><Select value={newAlertData.pickupTimeSlot} onChange={(e) => setNewAlertData({ ...newAlertData, pickupTimeSlot: e.target.value })} label="Preferred Pickup Time Slot"><MenuItem value="9am-12pm">Morning (9 AM - 12 PM)</MenuItem><MenuItem value="12pm-3pm">Afternoon (12 PM - 3 PM)</MenuItem><MenuItem value="3pm-6pm">Evening (3 PM - 6 PM)</MenuItem></Select></FormControl></Grid>
                <Grid item xs={12}><TextField fullWidth label="Description (optional)" multiline rows={3} value={newAlertData.description} onChange={(e) => setNewAlertData({ ...newAlertData, description: e.target.value })} /></Grid>
                <Grid item xs={12}><Button variant="outlined" component="label" fullWidth startIcon={<UploadIcon />}>{imageFile ? `Selected: ${imageFile.name}` : 'Upload Image (Optional)'}<input type="file" hidden onChange={handleFileChange} accept="image/*" /></Button></Grid>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, textAlign: 'center', borderColor: 'primary.main' }}>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <IncentiveIcon color="primary" />
                          Estimated Incentive Value: 
                          <Typography component="span" variant="h6" color="primary.main" fontWeight="bold">
                              ₹{estimatedIncentive}
                          </Typography>
                      </Typography>
                  </Paper>
                </Grid>
=======
                <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>{t('userDashboard.postAlert.wasteType')}</InputLabel><Select value={newAlertData.wasteType} onChange={(e) => setNewAlertData({ ...newAlertData, wasteType: e.target.value })} label={t('userDashboard.postAlert.wasteType')}><MenuItem value="PLASTIC">{t('userDashboard.postAlert.wasteTypes.plastic')}</MenuItem><MenuItem value="PAPER">{t('userDashboard.postAlert.wasteTypes.paper')}</MenuItem><MenuItem value="METAL">{t('userDashboard.postAlert.wasteTypes.metal')}</MenuItem><MenuItem value="GLASS">{t('userDashboard.postAlert.wasteTypes.glass')}</MenuItem><MenuItem value="E_WASTE">{t('userDashboard.postAlert.wasteTypes.eWaste')}</MenuItem><MenuItem value="ORGANIC">{t('userDashboard.postAlert.wasteTypes.organic')}</MenuItem><MenuItem value="MEDICAL">{t('userDashboard.postAlert.wasteTypes.medical')}</MenuItem><MenuItem value="HAZARDOUS">{t('userDashboard.postAlert.wasteTypes.hazardous')}</MenuItem><MenuItem value="TEXTILE">{t('userDashboard.postAlert.wasteTypes.textile')}</MenuItem><MenuItem value="BULBS">{t('userDashboard.postAlert.wasteTypes.bulbs')}</MenuItem><MenuItem value="CONSTRUCTION_DEBRIS">{t('userDashboard.postAlert.wasteTypes.constructionDebris')}</MenuItem><MenuItem value="SANITARY">{t('userDashboard.postAlert.wasteTypes.sanitary')}</MenuItem><MenuItem value="OTHER">{t('userDashboard.postAlert.wasteTypes.other')}</MenuItem></Select></FormControl></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label={t('userDashboard.postAlert.estimatedWeight')} type="number" value={newAlertData.weightEstimate} onChange={(e) => setNewAlertData({ ...newAlertData, weightEstimate: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth label={t('userDashboard.postAlert.pickupAddress')} value={newAlertData.pickupAddress} onChange={(e) => setNewAlertData({ ...newAlertData, pickupAddress: e.target.value })} /></Grid>
                <Grid item xs={12}><FormControl fullWidth><InputLabel>{t('userDashboard.postAlert.preferredPickupTime')}</InputLabel><Select value={newAlertData.pickupTimeSlot} onChange={(e) => setNewAlertData({ ...newAlertData, pickupTimeSlot: e.target.value })} label={t('userDashboard.postAlert.preferredPickupTime')}><MenuItem value="9am-12pm">{t('userDashboard.postAlert.timeSlots.morning')}</MenuItem><MenuItem value="12pm-3pm">{t('userDashboard.postAlert.timeSlots.afternoon')}</MenuItem><MenuItem value="3pm-6pm">{t('userDashboard.postAlert.timeSlots.evening')}</MenuItem></Select></FormControl></Grid>
                <Grid item xs={12}><TextField fullWidth label={t('userDashboard.postAlert.description')} multiline rows={3} value={newAlertData.description} onChange={(e) => setNewAlertData({ ...newAlertData, description: e.target.value })} /></Grid>
                <Grid item xs={12}><Button variant="outlined" component="label" fullWidth startIcon={<UploadIcon />}>{imageFile ? t('userDashboard.postAlert.selectedImage', { filename: imageFile.name }) : t('userDashboard.postAlert.uploadImage')}<input type="file" hidden onChange={handleFileChange} accept="image/*" /></Button></Grid>
>>>>>>> 2afac7eda8a727842d25a5ce142ac1be43f1892e
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>{t('userDashboard.postAlert.cancel')}</Button>
              <Button onClick={handleCreateAlert} variant="contained" disabled={loading} sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }}>{loading ? <CircularProgress size={24} /> : t('userDashboard.postAlert.createAlert')}</Button>
            </DialogActions>
          </Dialog>
        </div>
      </DashboardLayout>
    </Box>
  );
}
