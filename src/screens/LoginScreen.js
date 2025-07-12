import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { storeAuthData } from '../utils/auth';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('collector');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Login credentials for each role
  const roleCredentials = {
    user: {
      email: 'user@EcoDrop.com',
      password: 'user123',
      name: 'Demo User',
      redirect: '/user-dashboard'
    },
    admin: {
      email: 'admin@EcoDrop.com',
      password: 'admin123',
      name: 'Demo Admin',
      redirect: '/admin-dashboard'
    },
    collector: {
      email: 'collector@EcoDrop.com',
      password: 'collector123',
      name: 'Demo Collector',
      redirect: '/dashboard'
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const credentials = roleCredentials[role];
    
    if (email !== credentials.email || password !== credentials.password) {
      setError('Invalid credentials for selected role');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const mockUser = {
        id: 1,
        email: email,
        name: credentials.name,
        role: role,
      };
      
      storeAuthData('demo-token-123', mockUser.id, mockUser);
      navigate(credentials.redirect);
      setLoading(false);
    }, 1000);
  };

  const handleQuickLogin = (selectedRole) => {
    const credentials = roleCredentials[selectedRole];
    setEmail(credentials.email);
    setPassword(credentials.password);
    setRole(selectedRole);
    
    setTimeout(() => {
      const mockUser = {
        id: 1,
        email: credentials.email,
        name: credentials.name,
        role: selectedRole,
      };
      
      storeAuthData('demo-token-123', mockUser.id, mockUser);
      navigate(credentials.redirect);
    }, 500);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          {/* Header */}
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              color: '#4CAF50',
              fontWeight: 'bold',
              marginBottom: 1,
            }}
          >
            EcoDrop
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            CircleUp Portal
          </Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{ fontStyle: 'italic', marginBottom: 4 }}
          >
            Discover • Claim • Collect • Manage
          </Typography>

          {/* Quick Login Cards */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
            🚀 Quick Demo Login
          </Typography>
          
          <Box display="flex" gap={2} mb={4} flexWrap="wrap">
            <Card sx={{ flex: 1, minWidth: '200px', cursor: 'pointer' }} onClick={() => handleQuickLogin('user')}>
              <CardContent>
                <Typography variant="h6" color="primary">👤 User</Typography>
                <Typography variant="body2" color="textSecondary">
                  user@EcoDrop.com<br/>
                  Password: user123
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Post materials for pickup
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ flex: 1, minWidth: '200px', cursor: 'pointer' }} onClick={() => handleQuickLogin('collector')}>
              <CardContent>
                <Typography variant="h6" color="primary">🚛 Collector</Typography>
                <Typography variant="body2" color="textSecondary">
                  collector@EcoDrop.com<br/>
                  Password: collector123
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Claim and collect materials
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ flex: 1, minWidth: '200px', cursor: 'pointer' }} onClick={() => handleQuickLogin('admin')}>
              <CardContent>
                <Typography variant="h6" color="primary">⚙️ Admin</Typography>
                <Typography variant="body2" color="textSecondary">
                  admin@EcoDrop.com<br/>
                  Password: admin123
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Manage users and system
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Divider sx={{ my: 3 }}>OR</Divider>

          {/* Manual Login Form */}
          <Typography variant="h6" gutterBottom>
            Manual Login
          </Typography>
          
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>Select Role</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                label="Select Role"
              >
                <MenuItem value="user">👤 User</MenuItem>
                <MenuItem value="collector">🚛 Waste Collector</MenuItem>
                <MenuItem value="admin">⚙️ Admin</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              variant="outlined"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: '#4CAF50',
                '&:hover': {
                  backgroundColor: '#2E7D32',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          {/* Footer */}
          <Typography variant="caption" color="textSecondary" sx={{ mt: 3 }}>
            Powered by Oracle Cloud Infrastructure
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginScreen; 