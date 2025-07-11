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
import authService from '../services/authService';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('collector');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Login credentials for each role (demo mode)
  const roleCredentials = {
    user: {
      email: 'user@smartrecycle.com',
      password: 'user123',
      name: 'Demo User',
      redirect: '/user-dashboard'
    },
    admin: {
      email: 'admin@smartrecycle.com',
      password: 'admin123',
      name: 'Demo Admin',
      redirect: '/admin-dashboard'
    },
    collector: {
      email: 'collector@smartrecycle.com',
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

    setLoading(true);
    
    try {
      // Use Oracle Cloud authentication service
      const result = await authService.login(email, password, role);
      
      if (result.success) {
        console.log('✅ Login successful, redirecting...');
        
        // Determine redirect path based on user role
        const redirectPath = getRedirectPath(result.user.role);
        navigate(redirectPath);
      } else {
        // If Oracle Cloud authentication fails, try demo mode
        console.log('🔄 Oracle Cloud auth failed, trying demo mode...');
        await handleDemoLogin(email, password, role);
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      // Fallback to demo mode
      await handleDemoLogin(email, password, role);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (email, password, role) => {
    const credentials = roleCredentials[role];
    
    if (email !== credentials.email || password !== credentials.password) {
      setError('Invalid credentials for selected role');
      return;
    }

    // Simulate Oracle Cloud login delay
    setTimeout(() => {
      const mockUser = {
        id: 1,
        email: email,
        name: credentials.name,
        role: role,
      };
      
      // Store auth data locally (demo mode)
      localStorage.setItem('auth_token', 'demo-token-123');
      localStorage.setItem('user_id', mockUser.id.toString());
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      
      console.log('✅ Demo login successful');
      navigate(credentials.redirect);
    }, 1000);
  };

  const getRedirectPath = (userRole) => {
    switch (userRole) {
      case 'admin':
        return '/admin-dashboard';
      case 'user':
        return '/user-dashboard';
      case 'collector':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  const handleQuickLogin = async (selectedRole) => {
    const credentials = roleCredentials[selectedRole];
    setEmail(credentials.email);
    setPassword(credentials.password);
    setRole(selectedRole);
    setLoading(true);
    
    try {
      // Try Oracle Cloud authentication first
      const result = await authService.login(credentials.email, credentials.password, selectedRole);
      
      if (result.success) {
        console.log('✅ Quick login via Oracle Cloud successful');
        const redirectPath = getRedirectPath(result.user.role);
        navigate(redirectPath);
      } else {
        throw new Error('Oracle Cloud auth failed');
      }
    } catch (error) {
      console.log('🔄 Oracle Cloud quick login failed, using demo mode...');
      
      // Fallback to demo mode
      setTimeout(() => {
        const mockUser = {
          id: 1,
          email: credentials.email,
          name: credentials.name,
          role: selectedRole,
        };
        
        localStorage.setItem('auth_token', 'demo-token-123');
        localStorage.setItem('user_id', mockUser.id.toString());
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        
        navigate(credentials.redirect);
        setLoading(false);
      }, 500);
    }
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
            SmartRecycle
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            CircleUp Portal
          </Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{ fontStyle: 'italic', marginBottom: 2 }}
          >
            Discover • Claim • Collect • Manage
          </Typography>
          
          {/* Oracle Cloud Badge */}
          <Typography
            variant="caption"
            sx={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '4px 8px',
              borderRadius: 1,
              marginBottom: 4,
              display: 'inline-block',
            }}
          >
            🔴 Powered by Oracle Cloud Infrastructure
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
                  user@smartrecycle.com<br/>
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
                  collector@smartrecycle.com<br/>
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
                  admin@smartrecycle.com<br/>
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In with Oracle Cloud'}
            </Button>
          </Box>

          {/* Footer */}
          <Typography variant="caption" color="textSecondary" sx={{ mt: 3 }}>
            🔴 Demo Mode: Falls back to local auth if Oracle Cloud is unavailable
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginScreen; 