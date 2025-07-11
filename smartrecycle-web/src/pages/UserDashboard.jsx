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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  ExitToApp as LogoutIcon,
  Recycling as RecyclingIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    type: '',
    weight: '',
    description: '',
    location: '',
    contact: '',
  });

  // Mock user data
  const user = {
    name: 'Demo User',
    email: 'user@smartrecycle.com',
    totalPosts: 12,
    totalWeight: 45.7, // kg
    co2Saved: 23.4, // kg
  };

  // Mock posted materials
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
            <Card>
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
            <Card>
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
            <Card>
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
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                  🏆
                </Avatar>
                <Typography variant="h4" color="info.main">
                  Gold
                </Typography>
                <Typography color="textSecondary">
                  Eco Status
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* My Posted Materials */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              My Posted Materials
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
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add material"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => setOpenDialog(true)}
        >
          <AddIcon />
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