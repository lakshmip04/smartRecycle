import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Chip,
  List,
  ListItemButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Divider,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Verified as VerifiedIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Logout as LogoutIcon,
  Nature as EcoIcon,
  AdminPanelSettings as AdminIcon,
  BusinessCenter as CollectorIcon,
  Language as LanguageIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

// --- Import your DashboardLayout component ---
import DashboardLayout from '../components/DashboardLayout';
import LanguageSwitcher from '../components/LanguageSwitcher';

// --- A reusable styled Paper component to match the theme ---
const StyledPaper = (props) => (
  <Paper
    elevation={4}
    sx={{
      p: { xs: 2, sm: 3 },
      borderRadius: 4,
      backdropFilter: 'blur(8px)',
      background: 'rgba(255,255,255,0.92)',
      ...props.sx,
    }}
    {...props}
  >
    {props.children}
  </Paper>
);

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Data State
  const [user, setUser] = useState(null);
  const [editedData, setEditedData] = useState({});

  // --- DYNAMIC NAVIGATION LOGIC ---
  const navItems = useMemo(() => {
    if (!user) return []; // Return empty if user is not yet loaded

    const getDashboardPath = (role) => {
      switch (role) {
        case 'ADMIN':
          return '/admin-dashboard';
        case 'HOUSEHOLD':
          return '/user-dashboard';
        case 'COLLECTOR':
          return '/collector-dashboard';
        default:
          return '/'; // Fallback path
      }
    };

    const getDashboardIcon = (role) => {
      switch (role) {
        case 'ADMIN': return <AdminIcon />;
        case 'HOUSEHOLD': return <EcoIcon />;
        case 'COLLECTOR': return <CollectorIcon />;
        default: return <EcoIcon />;
      }
    }

    return [
      { name: 'Dashboard', path: getDashboardPath(user.role), icon: getDashboardIcon(user.role) },
      { name: 'My Profile', path: '/profile', icon: <PersonIcon /> },
    ];
  }, [user]);

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  useEffect(() => {
    const storedUserData = localStorage.getItem('user_data');
    if (!storedUserData) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUserData);
    setUser(parsedUser);
    setEditedData({
      name: parsedUser.profile?.name || '',
      phone: parsedUser.phone || '',
      address: parsedUser.profile?.address || '',
      vehicleDetails: parsedUser.profile?.vehicleDetails || '',
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

      setSnackbar({ open: true, message: t('profile.profileUpdateSuccess'), severity: 'success' });
      setEditing(false);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || t('profile.profileUpdateError'), severity: 'error' });
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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#e9f5ec' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden', position: 'relative', background: '#e9f5ec' }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: '#ffffff00' } },
          fpsLimit: 60,
          interactivity: { events: { onHover: { enable: true, mode: 'repulse' } }, modes: { repulse: { distance: 100 } } },
          particles: {
            color: { value: '#4CAF50' },
            links: { enable: true, color: '#4CAF50', distance: 150 },
            move: { enable: true, speed: 1.5 },
            size: { value: { min: 1, max: 3 } },
            number: { value: 60 }
          }
        }}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, width: '100%', height: '100%' }}
      />

      <DashboardLayout navItems={navItems} pageTitle="My Profile">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Grid container spacing={3}>
            {/* Left Column: Unified Profile Card */}
            <Grid item xs={12} md={4}>
              <StyledPaper>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 100, height: 100, bgcolor: '#2E7D32', fontSize: '3rem', mx: 'auto', mb: 2 }}>
                    <PersonIcon sx={{ fontSize: '4rem' }} />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: '#2E7D32' }}>{user.profile?.name}</Typography>
                  <Typography variant="body1" color="text.secondary">{user.email}</Typography>
                  {user.profile?.isVerified && <Chip icon={<VerifiedIcon />} label={t('profile.verified')} color="success" size="small" sx={{ mt: 1.5 }} />}
                </Box>
                <Divider sx={{ my: 2 }} />
                <List dense>
                  <ListItemButton><ListItemIcon><NotificationsIcon sx={{ color: '#4CAF50' }} /></ListItemIcon><ListItemText primary={t('profile.notifications')} /></ListItemButton>
                  <ListItemButton><ListItemIcon><HelpIcon sx={{ color: '#4CAF50' }} /></ListItemIcon><ListItemText primary={t('profile.help')} /></ListItemButton>
                  <ListItemButton><ListItemIcon><InfoIcon sx={{ color: '#4CAF50' }} /></ListItemIcon><ListItemText primary={t('profile.about')} /></ListItemButton>
                </List>
                <Divider sx={{ my: 2 }} />
                <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={() => setLogoutDialog(true)}>
                  {t('profile.logout')}
                </Button>
              </StyledPaper>
            </Grid>

            {/* Right Column: Profile Details Form */}
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <StyledPaper>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#2E7D32' }}>{t('profile.profileInformation')}</Typography>
                    {!editing && <Button startIcon={<EditIcon />} onClick={() => setEditing(true)} variant="contained" sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }}>{t('profile.edit')}</Button>}
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}><TextField fullWidth label={t('profile.fullName')} value={editedData.name || ''} onChange={(e) => setEditedData({ ...editedData, name: e.target.value })} disabled={!editing} variant="outlined" /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label={t('profile.phoneNumber')} value={editedData.phone || ''} onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })} disabled={!editing} variant="outlined" /></Grid>
                    <Grid item xs={12}><TextField fullWidth label={t('profile.address')} multiline rows={2} value={editedData.address || ''} onChange={(e) => setEditedData({ ...editedData, address: e.target.value })} disabled={!editing} variant="outlined" /></Grid>
                    {user.role === 'COLLECTOR' && (<Grid item xs={12}><TextField fullWidth label={t('profile.vehicleDetails')} value={editedData.vehicleDetails || ''} onChange={(e) => setEditedData({ ...editedData, vehicleDetails: e.target.value })} disabled={!editing} variant="outlined" /></Grid>)}
                    <Grid item xs={12} sm={6}><TextField fullWidth label={t('profile.email')} value={user.email} disabled variant="filled" helperText={t('profile.emailHelper')} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label={t('profile.memberSince')} value={new Date(user.createdAt).toLocaleDateString()} disabled variant="filled" /></Grid>
                  </Grid>
                  {editing && (
                    <Box display="flex" gap={2} mt={3}>
                      <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
                        {saving ? t('profile.saving') : t('profile.save')}
                      </Button>
                      <Button variant="outlined" onClick={handleCancel} disabled={saving}>{t('profile.cancel')}</Button>
                    </Box>
                  )}
                </StyledPaper>

                <StyledPaper>
                  <Box mb={3}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <LanguageIcon sx={{ color: '#4CAF50', mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#2E7D32' }}>
                        {t('profile.languagePreferences')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      {t('profile.languageDescription')}
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body1" sx={{ minWidth: '120px' }}>
                        {t('profile.selectLanguage')}:
                      </Typography>
                      <LanguageSwitcher 
                        variant="outlined" 
                        showLabel={false}
                        sx={{ 
                          '& .MuiFormControl-root': { 
                            minWidth: '200px',
                            bgcolor: 'white'
                          }
                        }} 
                      />
                    </Box>
                    
                    <Box mt={2} p={2} sx={{ bgcolor: '#f0f8f0', borderRadius: 2, border: '1px solid #e0f0e0' }}>
                      <Typography variant="body2" color="text.secondary">
                        💡 {t('profile.languageNote')}
                      </Typography>
                    </Box>
                  </Box>
                </StyledPaper>

                {/* ADDED: Customer Care Section */}
                <StyledPaper>
                    <Box display="flex" alignItems="center" mb={2}>
                        <HelpIcon sx={{ color: '#4CAF50', mr: 1 }} />
                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#2E7D32' }}>
                            Customer Care
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <List dense>
                        <ListItem>
                            <ListItemIcon><BusinessIcon /></ListItemIcon>
                            <ListItemText primary="EcoDrop Headquarters" secondary="Hitech City, Hyderabad, Telangana, 500081" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><PhoneIcon /></ListItemIcon>
                            <ListItemText primary="Support Hotline" secondary="+91 40 1234 5678" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><EmailIcon /></ListItemIcon>
                            <ListItemText primary="Support Email" secondary="support@ecodrop.com" />
                        </ListItem>
                    </List>
                </StyledPaper>
              </Stack>
            </Grid>
          </Grid>

          <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)}>
            <DialogTitle>{t('profile.logout')}</DialogTitle>
            <DialogContent><Typography>{t('profile.logoutConfirm')}</Typography></DialogContent>
            <DialogActions>
              <Button onClick={() => setLogoutDialog(false)}>{t('profile.cancel')}</Button>
              <Button onClick={confirmLogout} color="error" variant="contained">{t('profile.logout')}</Button>
            </DialogActions>
          </Dialog>

          <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
          </Snackbar>
        </motion.div>
      </DashboardLayout>
    </Box>
  );
}
