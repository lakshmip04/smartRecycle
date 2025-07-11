import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';
import WasteClassifier from '../components/WasteClassifier';

const AvailableMaterialsScreen = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Mock data for available materials
    const mockMaterials = [
      {
        id: 1,
        type: 'PET Bottles',
        weight: 5.2,
        description: '50+ plastic bottles from office pantry. Clean and sorted.',
        location: 'Bandra West, Mumbai',
        distance: '2.3 km',
        postedBy: 'Rajesh Kumar',
        postedAt: '2 hours ago',
        contact: '+91 98765 43210',
        estimatedValue: '₹156',
        status: 'available',
        aiClassification: {
          waste_type: 'plastic',
          biodegradability: 'non-biodegradable',
          confidence: 95
        }
      },
      {
        id: 2,
        type: 'Cardboard',
        weight: 12.8,
        description: 'Amazon delivery boxes, clean and dry. Perfect for recycling.',
        location: 'Andheri East, Mumbai',
        distance: '4.7 km',
        postedBy: 'Priya Sharma',
        postedAt: '5 hours ago',
        contact: '+91 87654 32109',
        estimatedValue: '₹192',
        status: 'available',
        aiClassification: {
          waste_type: 'paper',
          biodegradability: 'biodegradable',
          confidence: 98
        }
      },
      {
        id: 3,
        type: 'E-waste',
        weight: 3.5,
        description: 'Old mobile phones, chargers, and small electronics.',
        location: 'Powai, Mumbai',
        distance: '8.1 km',
        postedBy: 'Tech Solutions Pvt Ltd',
        postedAt: '1 day ago',
        contact: '+91 76543 21098',
        estimatedValue: '₹875',
        status: 'available',
        aiClassification: {
          waste_type: 'electronic',
          biodegradability: 'non-biodegradable',
          confidence: 99
        }
      },
      {
        id: 4,
        type: 'Glass Bottles',
        weight: 8.0,
        description: 'Wine and beer bottles from restaurant. Clean condition.',
        location: 'Bandra West, Mumbai',
        distance: '2.8 km',
        postedBy: 'Cafe Mocha',
        postedAt: '3 hours ago',
        contact: '+91 65432 10987',
        estimatedValue: '₹240',
        status: 'available',
        aiClassification: {
          waste_type: 'glass',
          biodegradability: 'non-biodegradable',
          confidence: 97
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
        material.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMaterials(filtered);
  }, [materials, filterType, searchTerm]);

  const handleClaimMaterial = (materialId) => {
    navigate(`/material/${materialId}`);
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
                      {material.location} • {material.distance}
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
                      {material.weight} kg
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
        <WasteClassifier onClassificationComplete={handleClassificationComplete} />
      </TabPanel>
    </Box>
  );
};

export default AvailableMaterialsScreen; 