import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  Avatar,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fab,
  Tabs,
  Tab,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  ExitToApp as LogoutIcon,
  Recycling as RecyclingIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Nature as EcoIcon,
  Analytics as AnalyticsIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import AlertCard from '../components/AlertCard';
import WasteTypeBadge from '../components/WasteTypeBadge';
import StatusTag from '../components/StatusTag';
import WasteClassifier from '../components/WasteClassifier';
import WasteCollectorMap from '../components/WasteCollectorMap';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [newMaterial, setNewMaterial] = useState({
    type: '',
    weight: '',
    description: '',
    location: '',
    contact: '',
  });

  // New state for AI classification result
  const [aiClassificationResult, setAiClassificationResult] = useState(null);

  // Mock user data
  const user = {
    name: 'Demo User',
    email: 'user@smartrecycle.com',
    totalPosts: 15,
    totalWeight: 68.3, // kg
    co2Saved: 34.2, // kg
    totalEarnings: 1250, // rupees
  };

  // Mock waste alerts/posts with enhanced data
  const [wasteAlerts, setWasteAlerts] = useState([
    {
      id: 1,
      wasteType: 'Biodegradable',
      status: 'Pending',
      collector: null,
      location: { coordinates: [19.0596, 72.8295] },
      createdAt: '2024-01-20T10:30:00Z',
      notes: 'Kitchen waste from organic vegetables, well segregated',
      imageUrl: 'https://example.com/organic-waste.jpg',
      weight: 2.5,
      estimatedValue: '₹50'
    },
    {
      id: 2,
      wasteType: 'Non-biodegradable',
      status: 'Accepted',
      collector: 'Green Waste Co.',
      location: { coordinates: [19.0596, 72.8295] },
      createdAt: '2024-01-19T15:45:00Z',
      notes: 'Plastic bottles and containers, cleaned and sorted',
      imageUrl: 'https://example.com/plastic-waste.jpg',
      weight: 5.2,
      estimatedValue: '₹80'
    },
    {
      id: 3,
      wasteType: 'Non-biodegradable',
      status: 'Collected',
      collector: 'EcoCollect Services',
      location: { coordinates: [19.0596, 72.8295] },
      createdAt: '2024-01-18T09:20:00Z',
      notes: 'Electronic waste - old phones and chargers',
      imageUrl: 'https://example.com/ewaste.jpg',
      weight: 3.5,
      estimatedValue: '₹200'
    },
    {
      id: 4,
      wasteType: 'Biodegradable',
      status: 'Pending',
      collector: null,
      location: { coordinates: [19.0596, 72.8295] },
      createdAt: '2024-01-17T14:15:00Z',
      notes: 'Garden waste - leaves and small branches',
      imageUrl: 'https://example.com/garden-waste.jpg',
      weight: 8.0,
      estimatedValue: '₹40'
    },
    {
      id: 5,
      wasteType: 'Non-biodegradable',
      status: 'Accepted',
      collector: 'RecycleMax',
      location: { coordinates: [19.0596, 72.8295] },
      createdAt: '2024-01-16T11:00:00Z',
      notes: 'Cardboard boxes from online shopping, dry condition',
      imageUrl: 'https://example.com/cardboard.jpg',
      weight: 12.8,
      estimatedValue: '₹120'
    },
  ]);

  // Mock posted materials (keeping the original table view)
  const [postedMaterials, setPostedMaterials] = useState([
    {
      id: 1,
      type: 'PET Bottles',
      weight: 5.2,
      description: '50+ plastic bottles from office pantry',
      location: 'Bandra West, Mumbai',
      datePosted: '2024-01-15',
      status: 'Available',
      collectorName: null,
    },
    {
      id: 2,
      type: 'Cardboard',
      weight: 12.8,
      description: 'Amazon delivery boxes, clean and dry',
      location: 'Bandra West, Mumbai',
      datePosted: '2024-01-14',
      status: 'Collected',
      collectorName: 'Green Waste Co.',
    },
    {
      id: 3,
      type: 'E-waste',
      weight: 3.5,
      description: 'Old mobile phones and chargers',
      location: 'Bandra West, Mumbai',
      datePosted: '2024-01-13',
      status: 'Claimed',
      collectorName: 'EcoCollect Services',
    },
  ]);

  const materialTypes = [
    'PET Bottles',
    'Glass Bottles',
    'Cardboard',
    'Paper',
    'E-waste',
    'Metal',
    'Organic Waste',
    'Other',
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAddMaterial = () => {
    if (newMaterial.type && newMaterial.weight && newMaterial.location) {
      const material = {
        id: postedMaterials.length + 1,
        ...newMaterial,
        weight: parseFloat(newMaterial.weight),
        datePosted: new Date().toISOString().split('T')[0],
        status: 'Available',
        collectorName: null,
      };
      setPostedMaterials([material, ...postedMaterials]);
      setNewMaterial({
        type: '',
        weight: '',
        description: '',
        location: '',
        contact: '',
      });
      setOpenDialog(false);
    }
  };

  const handleClassificationComplete = (classificationData) => {
    // Store the classification result
    setAiClassificationResult({
      waste_type: classificationData.classification.waste_type,
      biodegradability: classificationData.classification.biodegradability,
      confidence: classificationData.classification.confidence,
      recycling_instructions: classificationData.classification.recycling_instructions,
      environmental_impact: classificationData.classification.environmental_impact,
      image: URL.createObjectURL(classificationData.image),
    });
    
    // Do NOT automatically create a waste alert here.
    // The user should review the classification and then decide to post it.
    
    // Switch to the AI Waste Classifier tab to show the new result
    setActiveTab(1);
  };

  // Function to create a waste alert from the AI classification result
  const createAlertFromAIResult = () => {
    if (aiClassificationResult) {
      const newAlert = {
        id: wasteAlerts.length + 1,
        wasteType: aiClassificationResult.biodegradability === 'biodegradable' ? 'Biodegradable' : 'Non-biodegradable',
        status: 'Pending',
        collector: null,
        location: { coordinates: [19.0596, 72.8295] }, // Placeholder, ideally from user input
        createdAt: new Date().toISOString(),
        notes: `AI-classified as ${aiClassificationResult.waste_type}. ${aiClassificationResult.recycling_instructions || ''}`,
        imageUrl: aiClassificationResult.image,
        weight: 0, // User should input this when posting
        estimatedValue: '₹0' // User should input this when posting
      };
      setWasteAlerts([newAlert, ...wasteAlerts]);
      setAiClassificationResult(null); // Clear the classification result after posting
      setActiveTab(0); // Go back to waste alerts tab
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Claimed':
        return 'warning';
      case 'Collected':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available':
        return <RecyclingIcon />;
      case 'Claimed':
        return <ScheduleIcon />;
      case 'Collected':
        return <CheckCircleIcon />;
      default:
        return <RecyclingIcon />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
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
            Welcome back, {user.name}! 👋
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Help create a circular economy by posting recyclable materials for collection.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ '&:hover': { elevation: 6 } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                  <RecyclingIcon />
                </Avatar>
                <Typography variant="h4" color="primary">
                  {user.totalPosts}
                </Typography>
                <Typography color="textSecondary">
                  Materials Posted
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ '&:hover': { elevation: 6 } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                  ⚖️
                </Avatar>
                <Typography variant="h4" color="success.main">
                  {user.totalWeight}kg
                </Typography>
                <Typography color="textSecondary">
                  Total Weight
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ '&:hover': { elevation: 6 } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                  🌍
                </Avatar>
                <Typography variant="h4" color="warning.main">
                  {user.co2Saved}kg
                </Typography>
                <Typography color="textSecondary">
                  CO₂ Saved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ '&:hover': { elevation: 6 } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                  💰
                </Avatar>
                <Typography variant="h4" color="info.main">
                  ₹{user.totalEarnings}
                </Typography>
                <Typography color="textSecondary">
                  Total Earnings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
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
              <Tab label="Posted Materials" icon={<RecyclingIcon />} />
            </Tabs>

            {/* Tab Content */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <EcoIcon sx={{ mr: 1 }} />
                  My Waste Alerts
                </Typography>
                <Stack spacing={2}>
                  {wasteAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </Stack>
                {wasteAlerts.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="textSecondary">
                      No waste alerts posted yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Use the AI Waste Classifier to create your first alert
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AnalyticsIcon sx={{ mr: 1 }} />
                  AI Waste Classifier
                </Typography>
                <WasteClassifier 
                  onClassificationComplete={handleClassificationComplete}
                />

                {aiClassificationResult && (
                  <Card variant="outlined" sx={{ mt: 4, p: 3, bgcolor: 'background.paper' }}>
                    <Typography variant="h6" gutterBottom>
                      Classification Result 🤖
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body1">
                            <strong>Waste Type:</strong> {aiClassificationResult.waste_type}
                          </Typography>
                          <Typography variant="body1">
                            <strong>Biodegradability:</strong> {aiClassificationResult.biodegradability}
                          </Typography>
                          <Typography variant="body1">
                            <strong>Confidence:</strong> {aiClassificationResult.confidence}%
                          </Typography>
                          <Typography variant="body1">
                            <strong>Recycling Instructions:</strong> {aiClassificationResult.recycling_instructions}
                          </Typography>
                          <Typography variant="body1">
                            <strong>Environmental Impact:</strong> {aiClassificationResult.environmental_impact}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {aiClassificationResult.image && (
                          <Box 
                            component="img" 
                            src={aiClassificationResult.image} 
                            alt="Classified Waste" 
                            sx={{ 
                              maxWidth: '100%', 
                              maxHeight: '200px', 
                              objectFit: 'contain', 
                              borderRadius: '8px' 
                            }} 
                          />
                        )}
                      </Grid>
                    </Grid>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      sx={{ mt: 3 }} 
                      onClick={createAlertFromAIResult}
                      startIcon={<AddIcon />}
                    >
                      Post as Waste Alert
                    </Button>
                  </Card>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <MapIcon sx={{ mr: 1 }} />
                  Find Nearest Waste Collectors
                </Typography>
                <WasteCollectorMap />
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <RecyclingIcon sx={{ mr: 1 }} />
                  Posted Materials (Legacy View)
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Material Type</TableCell>
                        <TableCell>Weight (kg)</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Date Posted</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Collector</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {postedMaterials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              {getStatusIcon(material.status)}
                              <Typography sx={{ ml: 1 }}>
                                {material.type}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{material.weight}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                              {material.location}
                            </Box>
                          </TableCell>
                          <TableCell>{material.datePosted}</TableCell>
                          <TableCell>
                            <Chip
                              label={material.status}
                              color={getStatusColor(material.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {material.collectorName || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="find collectors"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => setActiveTab(2)}
        >
          <MapIcon />
        </Fab>

        {/* Add Material Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Post New Material for Collection</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Material Type</InputLabel>
                  <Select
                    value={newMaterial.type}
                    onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                    label="Material Type"
                  >
                    {materialTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  type="number"
                  value={newMaterial.weight}
                  onChange={(e) => setNewMaterial({ ...newMaterial, weight: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  value={newMaterial.contact}
                  onChange={(e) => setNewMaterial({ ...newMaterial, contact: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pickup Location"
                  value={newMaterial.location}
                  onChange={(e) => setNewMaterial({ ...newMaterial, location: e.target.value })}
                  placeholder="e.g., Bandra West, Mumbai"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                  placeholder="Describe the condition and details of the material..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddMaterial} variant="contained">
              Post Material
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default UserDashboard;