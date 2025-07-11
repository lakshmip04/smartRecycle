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
} from '@mui/material';
import { storeAuthData } from '../utils/auth';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call for demo
      setTimeout(() => {
        // Mock successful login
        const mockUser = {
          id: 1,
          email: email,
          name: 'Demo Collector',
        };
        
        storeAuthData('demo-token-123', mockUser.id, mockUser);
        navigate('/dashboard');
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
      setError('Login failed. Please try again.');
    }
  };

  const handleQuickDemo = () => {
    const mockUser = {
      id: 1,
      email: 'demo.collector@smartrecycle.com',
      name: 'Demo Collector',
    };
    
    storeAuthData('demo-token-123', mockUser.id, mockUser);
    navigate('/dashboard');
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
      <Container maxWidth="sm">
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
            Waste Collector Portal
          </Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{ fontStyle: 'italic', marginBottom: 4 }}
          >
            Discover • Claim • Collect
          </Typography>

          {/* Login Form */}
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

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

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleQuickDemo}
              sx={{
                mb: 2,
                py: 1.5,
                borderColor: '#FF9800',
                color: '#FF9800',
                '&:hover': {
                  borderColor: '#F57C00',
                  backgroundColor: 'rgba(255, 152, 0, 0.04)',
                },
              }}
            >
              🚀 Quick Demo Login
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