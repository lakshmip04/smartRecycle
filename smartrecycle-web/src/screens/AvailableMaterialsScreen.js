import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from '@mui/icons-material';
import WasteClassifier from '../components/WasteClassifier';
import CollectorMap from '../components/CollectorMap';

const AvailableMaterialsScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [claimedMaterial, setClaimedMaterial] = useState(null);

  // Check if we're coming from a claimed material
  useEffect(() => {
    if (location.state?.claimedMaterial) {
      setClaimedMaterial(location.state.claimedMaterial);
      setActiveTab(location.state.activeTab || 1);
    }
  }, [location.state]);

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
      notes: 'Available for pickup between 9 AM - 6 PM',
      aiClassification: {
        waste_type: 'plastic',
        biodegradability: 'non-biodegradable',
        biodegradable: false,
        confidence: 95,
        recycling_instructions: 'Remove caps, rinse thoroughly, sort by color'
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
      notes: 'Need immediate pickup due to smell',
      aiClassification: {
        waste_type: 'organic',
        biodegradability: 'biodegradable',
        biodegradable: true,
        confidence: 98,
        recycling_instructions: 'Compost within 24 hours, separate wet and dry waste'
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
      notes: 'Corporate pickup, security clearance required',
      aiClassification: {
        waste_type: 'electronic',
        biodegradability: 'non-biodegradable',
        biodegradable: false,
        confidence: 99,
        recycling_instructions: 'Properly dispose at certified e-waste facility'
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
      notes: 'Pickup after 5 PM preferred',
      aiClassification: {
        waste_type: 'paper',
        biodegradability: 'biodegradable',
        biodegradable: true,
        confidence: 92,
        recycling_instructions: 'Remove plastic tape, rinse thoroughly, separate by paper type'
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
      notes: 'Handle with care, some items are fragile',
      aiClassification: {
        waste_type: 'glass',
        biodegradability: 'non-biodegradable',
        biodegradable: false,
        confidence: 97,
        recycling_instructions: 'Sort by color, remove labels and caps'
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
      notes: 'Industrial waste, safety equipment recommended',
      aiClassification: {
        waste_type: 'metal',
        biodegradability: 'non-biodegradable',
        biodegradable: false,
        confidence: 96,
        recycling_instructions: 'Sort by metal type, remove non-metal attachments'
      }
    }
  ];

    setMaterials(mockMaterials);
    setFilteredMaterials(mockMaterials);
  }, []);

  useEffect(() => {
    let filtered = materials;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(material => 
        material.type.toLowerCase().includes(filterType.toLowerCase())
      );
    }

    // Filter by search term
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
      // Navigate directly to collector map with claimed material data
      navigate('/dashboard/materials', { 
        state: { 
          claimedMaterial: material,
          activeTab: 1 // Set to Collection Map tab
        }
      });
    }
  };

  const handleClassificationComplete = (classificationData) => {
    // Add the classified waste to available materials
    const newMaterial = {
      id: materials.length + 1,
      type: classificationData.classification.waste_type,
      weight: 0, // Will be updated by user
      description: `AI-classified ${classificationData.classification.waste_type}`,
      location: 'Current Location',
      distance: '0 km',
      postedBy: 'You (AI Classified)',
      postedAt: 'Just now',
      contact: 'Your contact',
      estimatedValue: '₹0',
      status: 'pending',
      aiClassification: classificationData.classification
    };
    
    setMaterials(prev => [newMaterial, ...prev]);
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
      organic: '🍃'
    };
    return icons[wasteType] || '♻️';
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

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
                  {/* Header with type and AI classification */}
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

                  {/* AI Classification Badge */}
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
        <WasteClassifier onClassificationComplete={handleClassificationComplete} />
      </TabPanel>
    </Box>
  );
};

export default AvailableMaterialsScreen; 