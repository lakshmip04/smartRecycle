import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  IconButton,
  Fab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  Person,
  Refresh,
  ChevronRight,
} from '@mui/icons-material';

const AvailableMaterialsScreen = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableMaterials();
  }, []);

  const fetchAvailableMaterials = async () => {
    try {
      // Mock data for demo
      const mockMaterials = [
        {
          id: 1,
          title: 'Plastic Bottles (PET)',
          description: '5 large plastic bottles, clean condition',
          materialType: 'Plastic (PET)',
          condition: 'Good',
          quantity: '5 items',
          distance: '1.2 km',
          location: 'Green Valley, Block A',
          imageUrl: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=PET',
          userId: 101,
          userName: 'Sarah Johnson',
          status: 'available',
          timePosted: '2 hours ago',
          coordinates: { lat: 12.9716, lng: 77.5946 },
        },
        {
          id: 2,
          title: 'Cardboard Boxes',
          description: 'Multiple cardboard boxes from online deliveries',
          materialType: 'Cardboard',
          condition: 'Fair',
          quantity: '8 boxes',
          distance: '0.8 km',
          location: 'Sunrise Apartments',
          imageUrl: 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=BOX',
          userId: 102,
          userName: 'Mike Chen',
          status: 'available',
          timePosted: '4 hours ago',
          coordinates: { lat: 12.9716, lng: 77.5946 },
        },
        {
          id: 3,
          title: 'Electronic Waste',
          description: 'Old phone chargers, cables, and small electronics',
          materialType: 'E-Waste',
          condition: 'Mixed',
          quantity: '1 bag',
          distance: '2.1 km',
          location: 'Tech Park Plaza',
          imageUrl: 'https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=E-WASTE',
          userId: 103,
          userName: 'Alex Kumar',
          status: 'available',
          timePosted: '6 hours ago',
          coordinates: { lat: 12.9716, lng: 77.5946 },
        },
      ];

      setTimeout(() => {
        setMaterials(mockMaterials);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAvailableMaterials();
  };

  const navigateToDetails = (material) => {
    navigate(`/material/${material.id}`, { state: { material } });
  };

  const getMaterialTypeColor = (type) => {
    const colorMap = {
      'Plastic (PET)': '#4CAF50',
      'Cardboard': '#FF9800',
      'E-Waste': '#9C27B0',
      'Metal': '#607D8B',
      'Glass': '#00BCD4',
    };
    return colorMap[type] || '#757575';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Available Pickups
        </Typography>
        <IconButton onClick={onRefresh} disabled={refreshing}>
          <Refresh />
        </IconButton>
      </Box>

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Materials Available
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Check back later for new pickup opportunities in your area
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {materials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => navigateToDetails(material)}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={material.imageUrl}
                  alt={material.title}
                />
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" fontSize="1rem" fontWeight="bold" flexGrow={1}>
                      {material.title}
                    </Typography>
                    <Chip
                      label={material.materialType}
                      size="small"
                      sx={{
                        backgroundColor: getMaterialTypeColor(material.materialType),
                        color: 'white',
                        fontSize: '0.7rem',
                        ml: 1,
                      }}
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" mb={2} noWrap>
                    {material.description}
                  </Typography>

                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="caption" color="textSecondary" ml={0.5}>
                      {material.location} • {material.distance} away
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <Person fontSize="small" color="action" />
                      <Typography variant="caption" color="textSecondary" ml={0.5}>
                        {material.userName}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {material.timePosted}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Refresh FAB */}
      {refreshing && (
        <Fab
          color="primary"
          size="medium"
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 16,
          }}
        >
          <CircularProgress size={24} color="inherit" />
        </Fab>
      )}
    </Box>
  );
};

export default AvailableMaterialsScreen; 