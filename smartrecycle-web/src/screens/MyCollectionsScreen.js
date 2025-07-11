import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  LocationOn,
  Person,
  LocalShipping,
} from '@mui/icons-material';

const MyCollectionsScreen = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCollections();
  }, []);

  const fetchMyCollections = async () => {
    try {
      const mockCollections = [
        {
          id: 1,
          title: 'Plastic Bottles (PET)',
          description: '5 large plastic bottles, clean condition',
          materialType: 'Plastic (PET)',
          quantity: '5 items',
          location: 'Green Valley, Block A',
          imageUrl: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=PET',
          userName: 'Sarah Johnson',
          status: 'pending_pickup',
          claimedDate: '2024-01-15',
          estimatedValue: 'Rs.2.50',
        },
        {
          id: 2,
          title: 'Cardboard Boxes',
          description: 'Multiple cardboard boxes from online deliveries',
          materialType: 'Cardboard',
          quantity: '8 boxes',
          location: 'Sunrise Apartments',
          imageUrl: 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=BOX',
          userName: 'Mike Chen',
          status: 'collected',
          claimedDate: '2024-01-14',
          collectedDate: '2024-01-14',
          estimatedValue: '$1.20',
        },
        {
          id: 3,
          title: 'Electronic Waste',
          description: 'Old phone chargers, cables, and small electronics',
          materialType: 'E-Waste',
          quantity: '1 bag',
          location: 'Tech Park Plaza',
          imageUrl: 'https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=E-WASTE',
          userName: 'Alex Kumar',
          status: 'pending_pickup',
          claimedDate: '2024-01-15',
          estimatedValue: '$5.00',
        },
      ];

      setTimeout(() => {
        setCollections(mockCollections);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setLoading(false);
    }
  };

  const handleMarkAsCollected = (item) => {
    setConfirmDialog({ open: true, item });
  };

  const confirmCollection = () => {
    const { item } = confirmDialog;
    setCollections(prevCollections =>
      prevCollections.map(collection =>
        collection.id === item.id
          ? { ...collection, status: 'collected', collectedDate: new Date().toISOString().split('T')[0] }
          : collection
      )
    );
    setConfirmDialog({ open: false, item: null });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending_pickup':
        return {
          color: 'warning',
          icon: <Schedule />,
          text: 'Pending Pickup',
          actionText: 'Mark as Collected',
        };
      case 'collected':
        return {
          color: 'success',
          icon: <CheckCircle />,
          text: 'Collected',
          actionText: null,
        };
      default:
        return {
          color: 'default',
          icon: <Schedule />,
          text: 'Unknown',
          actionText: null,
        };
    }
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

  const pendingCount = collections.filter(c => c.status === 'pending_pickup').length;
  const collectedCount = collections.filter(c => c.status === 'collected').length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 10 }}>
      {/* Stats Header */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {pendingCount}
            </Typography>
            <Typography variant="caption" color="textSecondary" fontWeight="bold">
              PENDING
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {collectedCount}
            </Typography>
            <Typography variant="caption" color="textSecondary" fontWeight="bold">
              COLLECTED
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {collections.length}
            </Typography>
            <Typography variant="caption" color="textSecondary" fontWeight="bold">
              TOTAL
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Collections List */}
      {collections.length === 0 ? (
        <Box textAlign="center" py={8}>
          <LocalShipping sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Collections Yet
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Start claiming materials from the Available Materials tab to see them here
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard/materials')}
          >
            Browse Materials
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {collections.map((item) => {
            const statusInfo = getStatusInfo(item.status);
            
            return (
              <Grid item xs={12} md={6} key={item.id}>
                <Card elevation={2}>
                  <Box display="flex">
                    <CardMedia
                      component="img"
                      sx={{ width: 120, height: 120 }}
                      image={item.imageUrl}
                      alt={item.title}
                    />
                    <CardContent sx={{ flex: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" fontSize="1rem" fontWeight="bold" flexGrow={1}>
                          {item.title}
                        </Typography>
                        <Chip
                          icon={statusInfo.icon}
                          label={statusInfo.text}
                          color={statusInfo.color}
                          size="small"
                        />
                      </Box>

                      <Chip
                        label={item.materialType}
                        size="small"
                        sx={{
                          backgroundColor: getMaterialTypeColor(item.materialType),
                          color: 'white',
                          mb: 1,
                        }}
                      />

                      <Typography variant="body2" color="textSecondary" mb={1}>
                        {item.description}
                      </Typography>

                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="caption" color="textSecondary" ml={0.5} mr={2}>
                          {item.location}
                        </Typography>
                        <Person fontSize="small" color="action" />
                        <Typography variant="caption" color="textSecondary" ml={0.5}>
                          {item.userName}
                        </Typography>
                      </Box>

                      <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                        <strong>Claimed:</strong> {item.claimedDate}
                        {item.collectedDate && (
                          <>
                            <br />
                            <strong>Collected:</strong> {item.collectedDate}
                          </>
                        )}
                      </Typography>

                      <Typography variant="subtitle2" color="primary" fontWeight="bold">
                        Est. Value: {item.estimatedValue}
                      </Typography>
                    </CardContent>
                  </Box>

                  {statusInfo.actionText && (
                    <Box p={2} pt={0}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        onClick={() => handleMarkAsCollected(item)}
                      >
                        {statusInfo.actionText}
                      </Button>
                    </Box>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, item: null })}
      >
        <DialogTitle>Mark as Collected</DialogTitle>
        <DialogContent>
          <Typography>
            Have you successfully collected "{confirmDialog.item?.title}" from {confirmDialog.item?.userName}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, item: null })}>
            Cancel
          </Button>
          <Button onClick={confirmCollection} variant="contained">
            Yes, Collected
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyCollectionsScreen; 