import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
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

export default function ProfilePage() {
  const router = useRouter();
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Data State
  const [user, setUser] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    const storedUserData = localStorage.getItem('user_data');
    if (!storedUserData) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUserData);
    setUser(parsedUser);
    setEditedData({
        name: parsedUser.profile?.name,
        phone: parsedUser.phone,
        address: parsedUser.profile?.address,
        vehicleDetails: parsedUser.profile?.vehicleDetails,
    });
    setLoading(false);
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
        const response = await fetch(`/api/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: user.role,
                profileData: editedData
            })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        // Update localStorage with the latest data
        const updatedUser = {
            ...user,
            phone: editedData.phone,
            profile: {
                ...user.profile,
                name: editedData.name,
                address: editedData.address,
                vehicleDetails: editedData.vehicleDetails,
            }
        };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        setUser(updatedUser);

        setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
        setEditing(false);
    } catch (err) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
        setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData({
        name: user.profile?.name,
        phone: user.phone,
        address: user.profile?.address,
        vehicleDetails: user.profile?.vehicleDetails,
    });
    setEditing(false);
  };

  const confirmLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  if (loading || !user) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.100' }}>
      <Paper elevation={3} sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', color: 'white', p: 4, textAlign: 'center', borderRadius: 2, mb: 3 }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: '#2E7D32', fontSize: '2rem', mx: 'auto', mb: 2 }}><Person sx={{ fontSize: '2.5rem' }} /></Avatar>
        <Typography variant="h5" fontWeight="bold">{user.profile?.name}</Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>{user.email}</Typography>
        {user.profile?.isVerified && <Chip icon={<Verified />} label="Verified" color="success" size="small" sx={{ mt: 1 }}/>}
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold">Profile Information</Typography>
          {!editing && <Button startIcon={<Edit />} onClick={() => setEditing(true)} variant="outlined" size="small">Edit</Button>}
        </Box>
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Full Name" value={editedData.name || ''} onChange={(e) => setEditedData({ ...editedData, name: e.target.value })} disabled={!editing} variant="standard" />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone Number" value={editedData.phone || ''} onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })} disabled={!editing} variant="standard" />
            </Grid>
            <Grid item xs={12}>
                <TextField fullWidth label="Address" value={editedData.address || ''} onChange={(e) => setEditedData({ ...editedData, address: e.target.value })} disabled={!editing} variant="standard" />
            </Grid>
            {user.role === 'COLLECTOR' && (
                 <Grid item xs={12}>
                    <TextField fullWidth label="Vehicle Details" value={editedData.vehicleDetails || ''} onChange={(e) => setEditedData({ ...editedData, vehicleDetails: e.target.value })} disabled={!editing} variant="standard" />
                </Grid>
            )}
            <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" value={user.email} disabled variant="standard" helperText="Email cannot be changed" />
            </Grid>
             <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} disabled variant="standard" />
            </Grid>
        </Grid>
        {editing && (
          <Box display="flex" gap={2} mt={3}>
            <Button variant="outlined" onClick={handleCancel} disabled={saving}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} /> : null}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Paper>

      <Paper elevation={2} sx={{ mb: 3 }}>
        <List>
          <ListItemButton><ListItemIcon><Notifications /></ListItemIcon><ListItemText primary="Notifications" /></ListItemButton>
          <ListItemButton><ListItemIcon><Help /></ListItemIcon><ListItemText primary="Help & Support" /></ListItemButton>
          <ListItemButton><ListItemIcon><Info /></ListItemIcon><ListItemText primary="About SmartRecycle" /></ListItemButton>
        </List>
      </Paper>

      <Button fullWidth variant="outlined" color="error" startIcon={<Logout />} onClick={() => setLogoutDialog(true)} sx={{ py: 1.5 }}>
        Logout
      </Button>

      <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)}>
        <DialogTitle>Logout</DialogTitle>
        <DialogContent><Typography>Are you sure you want to logout?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialog(false)}>Cancel</Button>
          <Button onClick={confirmLogout} color="error" variant="contained">Logout</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
