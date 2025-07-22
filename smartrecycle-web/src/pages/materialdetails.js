import React, { useState, useEffect } from 'react';
import { useParams, useNavigate,useLocation } from 'react-router-dom';

import {
  Box,
  Card,
  CardMedia,
  Typography,
  Button,
  Chip,
  Grid,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Description,
  Inventory,
  Star,
  Schedule,
  LocationOn,
  NearMe,
  Directions,
  Person,
  CheckCircle,
  LocalShipping,
} from '@mui/icons-material';

const MaterialDetailsScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { material } = location.state || {};
  const [isClaimed, setIsClaimed] = useState(material?.status === 'claimed');
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  if (!material) {
    return (
      <Box p={2}>
        <Alert severity="error">Material not found</Alert>
      </Box>
    );
  }

  const handleClaimMaterial = () => {
    if (isClaimed) return;
    // Navigate to collector map with material data for route planning
    navigate('/dashboard/materials', { 
      state: { 
        claimedMaterial: material,
        activeTab: 1 // Set to Collection Map tab
      }
    });
  };

  const confirmClaim = () => {
    setLoading(true);
    setConfirmDialog(false);
    
    setTimeout(() => {
      setIsClaimed(true);
      setLoading(false);
    }, 1500);
  };

  const handleGetDirections = () => {
    const { lat, lng } = material.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
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

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 2 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      {/* Material Image */}
      <Card sx={{ mb: 3 }}>
        <Box position="relative">
          <CardMedia
            component="img"
            height="300"
            image={material.imageUrl}
            alt={material.title}
          />
          <Chip
            icon={isClaimed ? <CheckCircle /> : <LocalShipping />}
            label={isClaimed ? 'Claimed by You' : 'Available'}
            color={isClaimed ? 'success' : 'primary'}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>
      </Card>

      {/* Title and Type */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Typography variant="h4" fontWeight="bold" flexGrow={1}>
          {material.title}
        </Typography>
        <Chip
          label={material.materialType}
          sx={{
            backgroundColor: getMaterialTypeColor(material.materialType),
            color: 'white',
            ml: 2,
          }}
        />
      </Box>

      <Typography variant="body1" color="textSecondary" mb={3}>
        {isClaimed
          ? 'You have claimed this material. Coordinate with the user for pickup.'
          : 'This material is available for pickup.'}
      </Typography>

      <Grid container spacing={3}>
        {/* Material Details */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Material Details
            </Typography>

            <Box display="flex" alignItems="flex-start" mb={2}>
              <Description sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Description
                </Typography>
                <Typography variant="body2">{material.description}</Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="flex-start" mb={2}>
              <Inventory sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Quantity
                </Typography>
                <Typography variant="body2">{material.quantity}</Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="flex-start" mb={2}>
              <Star sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Condition
                </Typography>
                <Typography variant="body2">{material.condition}</Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="flex-start">
              <Schedule sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Posted
                </Typography>
                <Typography variant="body2">{material.timePosted}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Location Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Pickup Location
            </Typography>

            <Box display="flex" alignItems="flex-start" mb={2}>
              <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Address
                </Typography>
                <Typography variant="body2">{material.location}</Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="flex-start" mb={3}>
              <NearMe sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Distance
                </Typography>
                <Typography variant="body2">{material.distance} away</Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Directions />}
              onClick={handleGetDirections}
              sx={{ mb: 2 }}
            >
              Get Directions
            </Button>
          </Paper>

          {/* User Info */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Posted By
            </Typography>

            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <Person sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {material.userName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Material Owner
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Button */}
      <Box sx={{ position: 'fixed', bottom: 80, left: 0, right: 0, p: 2, backgroundColor: 'white', borderTop: 1, borderColor: 'divider' }}>
        <Box maxWidth="800px" mx="auto">
          {!isClaimed ? (
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LocalShipping />}
              onClick={handleClaimMaterial}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Claiming...' : '🚛 Claim Material'}
            </Button>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<CheckCircle />}
              disabled
              sx={{ py: 1.5, borderColor: 'success.main', color: 'success.main' }}
            >
              Material Claimed
            </Button>
          )}
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Claim Material</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to claim "{material.title}"? You'll be responsible for picking it up.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmClaim} variant="contained">
            Claim
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialDetailsScreen; 