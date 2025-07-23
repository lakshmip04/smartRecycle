import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Map as MapIcon,
  SmartToy as ChatbotIcon,
  Nature as EcoIcon,
  Person as PersonIcon // Added for profile link
} from '@mui/icons-material';
// --- Import your actual components ---
import DashboardLayout from '../components/DashboardLayout'; // Import the main layout
import AlertCard from '../components/AlertCard'; 
import WasteClassifier from '../components/WasteClassifier';
import RecycleRecommendationChatbot from '../components/RecycleRecommendationChatbot';

// Dynamically import the map component to prevent server-side rendering errors
const WasteCollectorMapWithNoSSR = dynamic(
  () => import('../components/WasteCollectorMap'),
  { 
    ssr: false,
    loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
  }
);

// A helper component to render the content of each tab
const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);


export default function UserDashboard() {
  const router = useRouter();
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // State for logged-in user and their data
  const [user, setUser] = useState(null);
  const [wasteAlerts, setWasteAlerts] = useState([]);

  // State for the "Create Alert" dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [newAlertData, setNewAlertData] = useState({
    wasteType: 'GENERAL',
    description: '',
    weightEstimate: '',
    pickupAddress: '',
  });

  // Define the navigation items specific to the User
  const userNavItems = [
    { name: 'Dashboard', path: '/user-dashboard', icon: <EcoIcon /> },
    { name: 'My Profile', path: '/profile', icon: <PersonIcon /> },
  ];

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
        if (!response.ok) {
          throw new Error('Failed to fetch alerts.');
        }
        const data = await response.json();
        setWasteAlerts(data.alerts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (parsedUser?.id) {
        fetchAlerts(parsedUser.id);
    } else {
        setLoading(false);
    }
  }, [router]);

  const handleCreateAlert = async () => {
    if (!newAlertData.wasteType || !newAlertData.weightEstimate || !newAlertData.pickupAddress) {
        setError('Please fill all required fields in the form.');
        return;
    }
    setError('');
    
    // In a real app, you'd get lat/lng from the address via a geocoding API
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
            });
        } else {
            setError(result.message || 'Failed to create alert.');
        }
    } catch (err) {
        setError('Could not connect to the server.');
    }
  };

  // This function is called by the WasteClassifier component when it has a result
  const handleClassificationComplete = (classificationData) => {
    // Pre-fill the new alert form with data from the AI
    setNewAlertData(prev => ({
        ...prev,
        description: `AI classified: ${classificationData.classification.waste_type}. ${classificationData.classification.recycling_instructions || ''}`,
        wasteType: classificationData.classification.biodegradability === 'biodegradable' ? 'ORGANIC' : 'RECYCLABLE'
    }));
    // Open the dialog so the user can complete and post the alert
    setOpenDialog(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    // The entire page is now wrapped in the DashboardLayout
    <DashboardLayout navItems={userNavItems} pageTitle="User Dashboard">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.profile?.name || 'User'}! 👋
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography>Total Posts</Typography><Typography variant="h4">{wasteAlerts.length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography>Pending</Typography><Typography variant="h4">{wasteAlerts.filter(a => a.status === 'PENDING').length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography>In Progress</Typography><Typography variant="h4">{wasteAlerts.filter(a => a.status === 'CLAIMED' || a.status === 'IN_TRANSIT').length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography>Completed</Typography><Typography variant="h4">{wasteAlerts.filter(a => a.status === 'COMPLETED').length}</Typography></CardContent></Card></Grid>
        </Grid>

        <Card elevation={3}>
          <CardContent>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab label="My Waste Alerts" icon={<EcoIcon />} />
              <Tab label="AI Waste Classifier" icon={<AnalyticsIcon />} />
              <Tab label="Find Collectors" icon={<MapIcon />} />
              <Tab label="3R Chatbot" icon={<ChatbotIcon />} />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" gutterBottom>My Waste Alerts</Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Stack spacing={2}>
                {wasteAlerts.length > 0 ? (
                  wasteAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))
                ) : (
                  <Typography color="textSecondary">No waste alerts posted yet.</Typography>
                )}
              </Stack>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
                <WasteClassifier onClassificationComplete={handleClassificationComplete} />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
                <WasteCollectorMapWithNoSSR />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
                <RecycleRecommendationChatbot />
            </TabPanel>
          </CardContent>
        </Card>

        <Fab
          color="primary"
          aria-label="Create new alert"
          sx={{ position: 'fixed', bottom: 32, right: 32 }}
          onClick={() => setOpenDialog(true)}
        >
          <AddIcon />
        </Fab>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Post New Waste Alert</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Waste Type</InputLabel>
                  <Select
                    value={newAlertData.wasteType}
                    onChange={(e) => setNewAlertData({ ...newAlertData, wasteType: e.target.value })}
                    label="Waste Type"
                  >
                    <MenuItem value="GENERAL">General</MenuItem>
                    <MenuItem value="RECYCLABLE">Recyclable</MenuItem>
                    <MenuItem value="E_WASTE">E-Waste</MenuItem>
                    <MenuItem value="ORGANIC">Organic</MenuItem>
                    <MenuItem value="HAZARDOUS">Hazardous</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Estimated Weight (kg)" type="number" value={newAlertData.weightEstimate} onChange={(e) => setNewAlertData({ ...newAlertData, weightEstimate: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Pickup Address" value={newAlertData.pickupAddress} onChange={(e) => setNewAlertData({ ...newAlertData, pickupAddress: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description (optional)" multiline rows={3} value={newAlertData.description} onChange={(e) => setNewAlertData({ ...newAlertData, description: e.target.value })} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateAlert} variant="contained">Create Alert</Button>
          </DialogActions>
        </Dialog>
    </DashboardLayout>
  );
}
