import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  History,
  Analytics,
  Logout,
} from '@mui/icons-material';

const UserDashboard = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F5F5F5', py: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" gutterBottom>
                👤 User Dashboard
              </Typography>
              <Typography variant="subtitle1">
                Welcome to SmartRecycle - Post your materials for pickup
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Logout
            </Button>
          </Box>
        </Paper>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Add sx={{ fontSize: 48, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Post New Material
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  List your recyclable materials for pickup
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <History sx={{ fontSize: 48, color: '#FF9800', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  My Listings
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  View and manage your posted materials
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Analytics sx={{ fontSize: 48, color: '#9C27B0', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Impact Report
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  See your environmental contribution
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Stats */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                8
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Materials Posted
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                6
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Successfully Collected
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                12.5 kg
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Weight Recycled
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                ₹48
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Environmental Value
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Box>
            <Typography variant="body2" color="textSecondary">
              🔄 Plastic bottles posted - 2 hours ago<br/>
              ✅ Cardboard collected by John Doe - Yesterday<br/>
              📱 Electronics posted - 3 days ago<br/>
              ✅ Paper materials collected by Alice Smith - 5 days ago
            </Typography>
          </Box>
        </Paper>

        {/* Coming Soon */}
        <Paper elevation={2} sx={{ p: 3, mt: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom color="primary">
            🚀 Coming Soon in Full Version
          </Typography>
          <Typography variant="body2" color="textSecondary">
            • AI-powered material classification<br/>
            • Real-time tracking of pickups<br/>
            • Reward points system<br/>
            • Community leaderboards<br/>
            • Environmental impact analytics
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserDashboard; 