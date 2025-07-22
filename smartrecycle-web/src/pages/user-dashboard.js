import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
  AppBar,
  Toolbar,
  Fab,
  Tabs,
  Tab,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  ExitToApp as LogoutIcon,
  Recycling as RecyclingIcon,
  Analytics as AnalyticsIcon,
  Map as MapIcon,
  SmartToy as ChatbotIcon,
  Eco as EcoIcon
} from '@mui/icons-material';
// Assuming your components are in src/components
// import AlertCard from '../components/AlertCard'; 
// import WasteClassifier from '../components/WasteClassifier';
// import WasteCollectorMap from '../components/WasteCollectorMap';
// import RecycleRecommendationChatbot from '../components/RecycleRecommendationChatbot';

// Placeholder component until you create the real one
const AlertCard = ({ alert }) => (
    <Card variant="outlined"><CardContent><Typography>{alert.description || 'No description'}</Typography><Typography variant="caption">Status: {alert.status}</Typography></CardContent></Card>
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

  // This useEffect hook runs when the component mounts
  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem('user_data');
    if (!storedUserData) {
      // If no user data, redirect to login page
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(storedUserData);
    setUser(parsedUser);

    // Function to fetch alerts from our backend API
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

    // Fetch the alerts for the logged-in user
    if (parsedUser?.id) {
        fetchAlerts(parsedUser.id);
    }
  }, [router]); // Dependency array ensures this runs only once

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleCreateAlert = async () => {
    if (!newAlertData.wasteType || !newAlertData.weightEstimate || !newAlertData.pickupAddress) {
        setError('Please fill all required fields in the form.');
        return;
    }
    setError('');
    
    // TODO: In a real app, you'd get lat/lng from the address via a geocoding API
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
            // Add the new alert to the top of our list to update the UI
            setWasteAlerts([result.alert, ...wasteAlerts]);
            setOpenDialog(false); // Close the dialog
            setNewAlertData({ // Reset the form
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.100', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            👤 User Dashboard - SmartRecycle
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.profile?.name || 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Here's an overview of your recycling activity. Create a new alert to get started.
          </Typography>
        </Box>

        {/* Stats Cards - You can wire these up later with aggregated data */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Placeholder stats cards */}
            <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography>Total Posts</Typography><Typography variant="h4">{wasteAlerts.length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography>Pending</Typography><Typography variant="h4">{wasteAlerts.filter(a => a.status === 'PENDING').length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography>In Progress</Typography><Typography variant="h4">{wasteAlerts.filter(a => a.status === 'CLAIMED' || a.status === 'IN_TRANSIT').length}</Typography></CardContent></Card></Grid>
            <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography>Completed</Typography><Typography variant="h4">{wasteAlerts.filter(a => a.status === 'COMPLETED').length}</Typography></CardContent></Card></Grid>
        </Grid>

        {/* Main Content with Tabs */}
        <Card elevation={3}>
          <CardContent>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab label="My Waste Alerts" icon={<EcoIcon />} />
              <Tab label="AI Waste Classifier" icon={<AnalyticsIcon />} />
              <Tab label="Find Collectors" icon={<MapIcon />} />
              <Tab label="3R Chatbot" icon={<ChatbotIcon />} />
            </Tabs>

            {/* Tab Content */}
            {activeTab === 0 && (
              <Box>
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
              </Box>
            )}

            {/* Add other tab panels here, linking to your other components */}
            {activeTab === 1 && <Typography>AI Waste Classifier Component Goes Here</Typography>}
            {activeTab === 2 && <Typography>Find Collectors Map Component Goes Here</Typography>}
            {activeTab === 3 && <Typography>Chatbot Component Goes Here</Typography>}
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="Create new alert"
          sx={{ position: 'fixed', bottom: 32, right: 32 }}
          onClick={() => setOpenDialog(true)}
        >
          <AddIcon />
        </Fab>

        {/* Add Material Dialog */}
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
                    {/* These values must match your Prisma Enum */}
                    <MenuItem value="GENERAL">General</MenuItem>
                    <MenuItem value="RECYCLABLE">Recyclable</MenuItem>
                    <MenuItem value="E_WASTE">E-Waste</MenuItem>
                    <MenuItem value="ORGANIC">Organic</MenuItem>
                    <MenuItem value="HAZARDOUS">Hazardous</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Estimated Weight (kg)"
                  type="number"
                  value={newAlertData.weightEstimate}
                  onChange={(e) => setNewAlertData({ ...newAlertData, weightEstimate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pickup Address"
                  value={newAlertData.pickupAddress}
                  onChange={(e) => setNewAlertData({ ...newAlertData, pickupAddress: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (optional)"
                  multiline
                  rows={3}
                  value={newAlertData.description}
                  onChange={(e) => setNewAlertData({ ...newAlertData, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateAlert} variant="contained">
              Create Alert
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
