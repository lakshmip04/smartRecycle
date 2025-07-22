import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Business,
  CalendarToday,
  Edit,
  Verified,
  Notifications,
  LocationOn,
  Help,
  Info,
  Logout,
} from '@mui/icons-material';
import { clearAuthData } from '../utils/auth';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const mockUserData = {
        id: 1,
        name: 'Demo Collector',
        email: 'demo.collector@smartrecycle.com',
        phone: '+1 (555) 123-4567',
        company: 'EcoCollect Solutions',
        joinDate: '2023-12-01',
        totalCollections: 47,
        totalEarnings: '$156.30',
        rating: 4.8,
        isVerified: true,
      };

      setTimeout(() => {
        setUserData(mockUserData);
        setEditedData(mockUserData);
      }, 500);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    
    setTimeout(() => {
      setUserData(editedData);
      setEditing(false);
      setLoading(false);
    }, 1000);
  };

  const handleCancel = () => {
    setEditedData(userData);
    setEditing(false);
  };

  const handleLogout = () => {
    setLogoutDialog(true);
  };

  const confirmLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  if (!userData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 10 }}>
      {/* Profile Header */}
      <Paper
        elevation={3}
        sx={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Box position="relative" display="inline-block">
          <Avatar
            sx={{
              width: 80,
              height: 80,
              backgroundColor: '#2E7D32',
              fontSize: '2rem',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Person sx={{ fontSize: '2rem' }} />
          </Avatar>
          {userData.isVerified && (
            <Chip
              icon={<Verified />}
              label="Verified"
              color="success"
              size="small"
              sx={{
                position: 'absolute',
                bottom: 10,
                right: -10,
                color: 'white',
              }}
            />
          )}
        </Box>

        <Typography variant="h5" fontWeight="bold" mb={1}>
          {userData.name}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }} mb={3}>
          {userData.email}
        </Typography>

        {/* Quick Stats */}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="h6" fontWeight="bold">
              {userData.totalCollections}
            </Typography>
            <Typography variant="caption">Collections</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h6" fontWeight="bold">
              {userData.totalEarnings}
            </Typography>
            <Typography variant="caption">Earned</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h6" fontWeight="bold">
              {userData.rating}⭐
            </Typography>
            <Typography variant="caption">Rating</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Profile Information */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold">
            Profile Information
          </Typography>
          {!editing && (
            <Button startIcon={<Edit />} onClick={handleEdit} variant="outlined" size="small">
              Edit
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="flex-start" mb={3}>
              <Person sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
              <Box flexGrow={1}>
                <Typography variant="subtitle2" color="textSecondary">
                  Full Name
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={editedData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    variant="outlined"
                  />
                ) : (
                  <Typography variant="body1">{userData.name}</Typography>
                )}
              </Box>
            </Box>

            <Box display="flex" alignItems="flex-start" mb={3}>
              <Email sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
              <Box flexGrow={1}>
                <Typography variant="subtitle2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">{userData.email}</Typography>
                <Typography variant="caption" color="textSecondary" fontStyle="italic">
                  Email cannot be changed
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="flex-start">
              <Phone sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
              <Box flexGrow={1}>
                <Typography variant="subtitle2" color="textSecondary">
                  Phone Number
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={editedData.phone}
                    onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                    variant="outlined"
                  />
                ) : (
                  <Typography variant="body1">{userData.phone}</Typography>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="flex-start" mb={3}>
              <Business sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
              <Box flexGrow={1}>
                <Typography variant="subtitle2" color="textSecondary">
                  Company/Organization
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={editedData.company}
                    onChange={(e) => setEditedData({ ...editedData, company: e.target.value })}
                    variant="outlined"
                  />
                ) : (
                  <Typography variant="body1">{userData.company}</Typography>
                )}
              </Box>
            </Box>

            <Box display="flex" alignItems="flex-start">
              <CalendarToday sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
              <Box flexGrow={1}>
                <Typography variant="subtitle2" color="textSecondary">
                  Member Since
                </Typography>
                <Typography variant="body1">{userData.joinDate}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Edit Actions */}
        {editing && (
          <Box display="flex" gap={2} mt={3}>
            <Button variant="outlined" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* App Settings */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ p: 3, pb: 1 }}>
          App Settings
        </Typography>
        
        <List>
          <ListItem button>
            <ListItemIcon>
              <Notifications />
            </ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItem>
          
          <ListItem button>
            <ListItemIcon>
              <LocationOn />
            </ListItemIcon>
            <ListItemText primary="Location Preferences" />
          </ListItem>
          
          <ListItem button>
            <ListItemIcon>
              <Help />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItem>
          
          <ListItem button>
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            <ListItemText primary="About SmartRecycle" />
          </ListItem>
        </List>
      </Paper>

      {/* Logout */}
      <Button
        fullWidth
        variant="outlined"
        color="error"
        startIcon={<Logout />}
        onClick={handleLogout}
        sx={{ py: 1.5 }}
      >
        Logout
      </Button>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)}>
        <DialogTitle>Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialog(false)}>Cancel</Button>
          <Button onClick={confirmLogout} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileScreen; 