import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Grid,
  Card,
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
  Snackbar, // Import Snackbar for notifications
  Alert,    // Import Alert for Snackbar content
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  Person,
  Search,
  FilterList,
  Recycling,
  Science,
  Map as MapIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import WasteClassifier from '../components/WasteClassifier';
import CollectorMap from '../components/CollectorMap';
import ConveyorBelt from '../components/ConveyorBelt';

const AvailableMaterialsScreen = () => {
  const router = useRouter();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [claimedMaterial, setClaimedMaterial] = useState(null);
  const [aiClassificationResult, setAiClassificationResult] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (router.query.claimedMaterial) {
      setClaimedMaterial(router.query.claimedMaterial);
      setActiveTab(router.query.activeTab || 1);
    }
  }, [router.query]);

  useEffect(() => {
    // Mock data for available materials
    const mockMaterials = [
      {
        id: 1,
        title: 'Plastic Bottles Collection',
        type: 'PET Bottles',
        description: '50+ PET bottles from office pantry, clean and sorted',
        wasteType: 'Plastic',
        weight: 5.2,
        location: [12.9716, 77.5946], // Bengaluru (City Center)
        address: 'MG Road, Bengaluru - 560001',
        distance: '2.3 km',
        postedBy: 'Rajesh Kumar',
        userName: 'Rajesh Kumar',
        contact: '+91 98765 43210',
        email: 'rajesh.kumar@email.com',
        postedAt: '2 hours ago',
        status: 'available',
        priority: 'medium',
        estimatedValue: '₹156',
        aiClassification: {
          waste_type: 'plastic',
          biodegradability: 'non-biodegradable',
          biodegradable: false,
          confidence: 95,
          recycling_instructions: 'Remove caps, rinse thoroughly, sort by color',
          environmental_impact: 'High'
        }
      },
      {
        id: 2,
        title: 'Organic Kitchen Waste',
        type: 'Organic Waste',
        description: 'Daily kitchen waste - vegetable peels, food scraps',
        wasteType: 'Organic',
        weight: 3.8,
        location: [12.9352, 77.6245], // Bengaluru (Koramangala)
        address: 'Koramangala, Bengaluru - 560034',
        distance: '4.7 km',
        postedBy: 'Priya Sharma',
        userName: 'Priya Sharma',
        contact: '+91 87654 32109',
        email: 'priya.sharma@email.com',
        postedAt: '1 hour ago',
        status: 'available',
        priority: 'high',
        estimatedValue: '₹76',
        aiClassification: {
          waste_type: 'organic',
          biodegradability: 'biodegradable',
          biodegradable: true,
          confidence: 98,
          recycling_instructions: 'Compost within 24 hours, separate wet and dry waste',
          environmental_impact: 'Low'
        }
      },
      {
        id: 3,
        title: 'Electronic Waste',
        type: 'E-waste',
        description: 'Old phones, chargers, and small electronic devices',
        wasteType: 'E-waste',
        weight: 2.1,
        location: [12.9827, 77.5900], // Bengaluru (Shivajinagar)
        address: 'Shivajinagar, Bengaluru - 560051',
        distance: '8.1 km',
        postedBy: 'Tech Solutions Ltd',
        userName: 'Tech Solutions Ltd',
        contact: '+91 76543 21098',
        email: 'disposal@techsolutions.com',
        postedAt: '4 hours ago',
        status: 'available',
        priority: 'medium',
        estimatedValue: '₹420',
        aiClassification: {
          waste_type: 'electronic',
          biodegradability: 'non-biodegradable',
          biodegradable: false,
          confidence: 99,
          recycling_instructions: 'Properly dispose at certified e-waste facility',
          environmental_impact: 'Very High'
        }
      },
      {
        id: 4,
        title: 'Mixed Paper & Cardboard',
        type: 'Cardboard',
        description: 'Amazon boxes, newspapers, office paper',
        wasteType: 'Paper',
        weight: 8.5,
        location: [12.9088, 77.6477], // Bengaluru (HSR Layout)
        address: 'HSR Layout, Bengaluru - 560102',
        distance: '2.8 km',
        postedBy: 'Café Mocha',
        userName: 'Café Mocha',
        contact: '+91 65432 10987',
        email: 'manager@cafemocha.com',
        postedAt: '6 hours ago',
        status: 'available',
        priority: 'low',
        estimatedValue: '₹255',
        aiClassification: {
          waste_type: 'paper',
          biodegradability: 'biodegradable',
          biodegradable: true,
          confidence: 92,
          recycling_instructions: 'Remove plastic tape, rinse thoroughly, separate by paper type',
          environmental_impact: 'Medium'
        }
      },
      {
        id: 5,
        title: 'Glass Bottles & Jars',
        type: 'Glass Bottles',
        description: 'Wine bottles, jam jars, glass containers',
        wasteType: 'Glass',
        weight: 6.3,
        location: [13.0298, 77.5707], // Bengaluru (Malleshwaram)
        address: 'Malleshwaram, Bengaluru - 560003',
        distance: '3.2 km',
        postedBy: 'Anil Patel',
        userName: 'Anil Patel',
        contact: '+91 54321 09876',
        email: 'anil.patel@email.com',
        postedAt: '8 hours ago',
        status: 'available',
        priority: 'medium',
        estimatedValue: '₹189',
        aiClassification: {
          waste_type: 'glass',
          biodegradability: 'non-biodegradable',
          biodegradable: false,
          confidence: 97,
          recycling_instructions: 'Sort by color, remove labels and caps',
          environmental_impact: 'Medium'
        }
      },
      {
        id: 6,
        title: 'Metal Scrap Collection',
        type: 'Metal Scrap',
        description: 'Aluminum cans, steel containers, wire scraps',
        wasteType: 'Metal',
        weight: 4.7,
        location: [13.0070, 77.5683], // Bengaluru (Rajajinagar)
        address: 'Rajajinagar, Bengaluru - 560010',
        distance: '5.1 km',
        postedBy: 'Bengaluru Metals Ltd',
        userName: 'Bengaluru Metals Ltd',
        contact: '+91 43210 98765',
        email: 'scrap@bengalurumetal.com',
        postedAt: '12 hours ago',
        status: 'available',
        priority: 'low',
        estimatedValue: '₹235',
        aiClassification: {
          waste_type: 'metal',
          biodegradability: 'non-biodegradable',
          biodegradable: false,
          confidence: 96,
          recycling_instructions: 'Sort by metal type, remove non-metal attachments',
          environmental_impact: 'High'
        }
      }
    ];

    setMaterials(mockMaterials);
    setFilteredMaterials(mockMaterials);
  }, []);

  useEffect(() => {
    let filtered = materials;

    if (filterType !== 'all') {
      filtered = filtered.filter(material =>
        material.type.toLowerCase().includes(filterType.toLowerCase())
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.address && material.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof material.location === 'string' && material.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredMaterials(filtered);
  }, [materials, filterType, searchTerm]);

  const handleClaimMaterial = (materialId) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      // Next.js: pass data via query or state management, not location.state
      router.push('/dashboard/materials');
    }
  };

  const handleClassificationComplete = (classificationData) => {
    console.log('handleClassificationComplete called with:', classificationData);
    
    // Store the classification result
    const result = {
      waste_type: classificationData.classification.waste_type,
      biodegradability: classificationData.classification.biodegradability,
      confidence: classificationData.classification.confidence,
      recycling_instructions: classificationData.classification.recycling_instructions,
      environmental_impact: classificationData.classification.environmental_impact,
      image: URL.createObjectURL(classificationData.image),
    };
    
    console.log('Setting aiClassificationResult to:', result);
    setAiClassificationResult(result);
    
    // Do NOT automatically create a material here.
    // The user should review the classification and then decide to add it.
  };

  // Function to create a material from the AI classification result
  const addClassifiedMaterialToAvailable = () => {
    if (aiClassificationResult) {
      // Check if the waste_type is 'human' - same logic as UserDashboard
      if (aiClassificationResult.waste_type.toLowerCase() === 'human') {
        setSnackbarMessage('Human detected in image. Please provide an image of waste material only.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setAiClassificationResult(null); // Clear the result
        return; // Stop processing invalid classification
      }

      // Create proper classification object matching the expected structure
      const aiClassification = {
        waste_type: aiClassificationResult.waste_type,
        biodegradability: aiClassificationResult.biodegradability,
        biodegradable: aiClassificationResult.biodegradability === 'biodegradable',
        confidence: aiClassificationResult.confidence,
        recycling_instructions: aiClassificationResult.recycling_instructions,
        environmental_impact: aiClassificationResult.environmental_impact
      };

      const newMaterial = {
        id: materials.length + 1,
        title: `AI Classified: ${aiClassificationResult.waste_type.charAt(0).toUpperCase() + aiClassificationResult.waste_type.slice(1)}`,
        type: aiClassificationResult.waste_type.charAt(0).toUpperCase() + aiClassificationResult.waste_type.slice(1),
        description: `AI-classified material. ${aiClassificationResult.recycling_instructions || 'No specific instructions provided.'}`,
        wasteType: aiClassificationResult.waste_type.charAt(0).toUpperCase() + aiClassificationResult.waste_type.slice(1),
        weight: '0 kg', // User should input this when posting
        location: [12.9716, 77.5946], // Default to Bengaluru coordinates - should be user input
        address: 'Location to be provided by user',
        distance: 'N/A',
        postedBy: 'AI Classification (Collector)',
        userName: 'Collector (AI Assist)',
        contact: 'Contact to be provided',
        email: 'collector@ecodrop.com',
        postedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' ago',
        status: 'available',
        priority: 'medium',
        estimatedValue: '₹0',
        aiClassification: aiClassification,
      };

      setMaterials(prev => [newMaterial, ...prev]);
      setAiClassificationResult(null); // Clear the classification result after adding
      setSnackbarMessage('New material added based on AI classification! Please update location and weight details.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setActiveTab(0); // Switch back to Available Materials tab
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'claimed':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getWasteTypeIcon = (wasteType) => {
    const icons = {
      plastic: '🥤',
      paper: '📄',
      electronic: '📱',
      glass: '🍾',
      metal: '🔧',
      organic: '🍃',
      textile: '👕',
      hazardous: '⚠️',
      medical: '🏥',
      cardboard: '📦',
      'e-waste': '📱'
      // Note: 'human' should never reach here as it's filtered out
    };
    return icons[wasteType?.toLowerCase()] || '♻️'; // Default recycling icon
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        Available Materials & AI Classifier
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab
          label="Available Materials"
          icon={<Recycling />}
          iconPosition="start"
        />
        <Tab
          label="Collection Map"
          icon={<MapIcon />}
          iconPosition="start"
        />
        <Tab
          label="AI Waste Classifier"
          icon={<Science />}
          iconPosition="start"
        />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        {/* Search and Filter Controls */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search materials"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by type</InputLabel>
              <Select
                value={filterType}
                label="Filter by type"
                onChange={(e) => setFilterType(e.target.value)}
                startAdornment={<FilterList sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="plastic">Plastic</MenuItem>
                <MenuItem value="paper">Paper/Cardboard</MenuItem>
                <MenuItem value="electronic">E-waste</MenuItem>
                <MenuItem value="glass">Glass</MenuItem>
                <MenuItem value="metal">Metal</MenuItem>
                <MenuItem value="organic">Organic</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Found {filteredMaterials.length} materials
            </Typography>
          </Grid>
        </Grid>

        {/* Materials Grid */}
        <Grid container spacing={3}>
          {filteredMaterials.map((material) => (
            <Grid item xs={12} md={6} lg={4} key={material.id}>
              <Card
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s ease-in-out',
                    boxShadow: 6,
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {getWasteTypeIcon(material.aiClassification?.waste_type)} {material.type}
                    </Typography>
                    <Chip
                      label={material.status}
                      color={getStatusColor(material.status)}
                      size="small"
                    />
                  </Box>

                  {material.aiClassification && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={`AI: ${material.aiClassification.biodegradability} (${material.aiClassification.confidence}%)`}
                        size="small"
                        variant="outlined"
                        color={material.aiClassification.biodegradability === 'biodegradable' ? 'success' : 'warning'}
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Box>
                  )}

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {material.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 1, color: 'action.active' }} />
                    <Typography variant="body2">
                      {material.address || material.location} • {material.distance}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ fontSize: 16, mr: 1, color: 'action.active' }} />
                    <Typography variant="body2">
                      {material.postedBy}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Schedule sx={{ fontSize: 16, mr: 1, color: 'action.active' }} />
                    <Typography variant="body2">
                      {material.postedAt}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {typeof material.weight === 'number' ? `${material.weight} kg` : material.weight}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {material.estimatedValue}
                    </Typography>
                  </Box>
                </CardContent>

                <Divider />

                <CardActions sx={{ p: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleClaimMaterial(material.id)}
                    disabled={material.status !== 'available'}
                    sx={{
                      backgroundColor: material.status === 'available' ? 'primary.main' : 'action.disabled',
                      '&:hover': {
                        backgroundColor: material.status === 'available' ? 'primary.dark' : 'action.disabled',
                      }
                    }}
                  >
                    {material.status === 'available' ? 'Claim Material' : 'Not Available'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredMaterials.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="textSecondary">
              No materials found matching your criteria
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Try adjusting your search or filter settings
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <CollectorMap claimedMaterial={claimedMaterial} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Science sx={{ mr: 1 }} />
            AI Waste Classifier
          </Typography>
          <WasteClassifier onClassificationComplete={handleClassificationComplete} showInternalResults={false} />

          {console.log('aiClassificationResult state:', aiClassificationResult)}
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
            </Card>
          )}

          {/* Conditionally render the conveyor belt animation */}
          {aiClassificationResult && aiClassificationResult.waste_type !== 'human' && (
            <>
              <Divider sx={{ my: 4 }} />
              {console.log('Rendering ConveyorBelt with:', aiClassificationResult)}
              <ConveyorBelt result={aiClassificationResult} />
            </>
          )}
          
        </Box>
      </TabPanel>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AvailableMaterialsScreen;