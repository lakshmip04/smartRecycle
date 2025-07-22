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
  MenuItem
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import authService from '../services/authService';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('collector');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  // ✅ Particle engine init fix
  const particlesInit = async (main) => {
    await loadFull(main);
  };

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

  const getRedirectPath = (userRole) => {
    switch (userRole) {
      case 'admin': return '/admin-dashboard';
      case 'user': return '/user-dashboard';
      case 'collector': return '/dashboard';
      default: return '/dashboard';
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
      const result = await authService.login(email, password, role);
      if (result.success) {
        await triggerSuccessAnimation(result.user.role);
      } else {
        await handleDemoLogin(email, password, role);
      }
    } catch {
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

    setTimeout(async () => {
      const mockUser = {
        id: 1,
        email: email,
        name: credentials.name,
        role: role
      };

      localStorage.setItem('auth_token', 'demo-token-123');
      localStorage.setItem('user_id', mockUser.id.toString());
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      await triggerSuccessAnimation(role);
    }, 1000);
  };

  const triggerSuccessAnimation = async (userRole) => {
    setFadeOut(true);
    setTimeout(() => {
      navigate(getRedirectPath(userRole));
    }, 800);
  };

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: '#ffffff00' } },
          fpsLimit: 60,
          interactivity: {
            events: { onClick: { enable: false }, onHover: { enable: true, mode: 'repulse' } },
            modes: { repulse: { distance: 100 } },
          },
          particles: {
            color: { value: '#4CAF50' },
            links: { enable: true, color: '#4CAF50', distance: 150 },
            move: { enable: true, speed: 2 },
            size: { value: { min: 1, max: 3 } },
            number: { value: 60 }
          }
        }}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      />

      <AnimatePresence>
        {!fadeOut && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.7 }}
          >
            <Container
              maxWidth="sm"
              sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1
              }}
            >
              <Paper
                elevation={12}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  textAlign: 'center',
                  backdropFilter: 'blur(6px)',
                  background: 'rgba(255,255,255,0.9)'
                }}
              >
                <Typography variant="h3" gutterBottom sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  EcoDrop
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                  Discover • Claim • Collect • Manage
                </Typography>

                <Typography variant="h6" gutterBottom>
                  Login
                </Typography>

                <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <FormControl fullWidth margin="normal">
                    <InputLabel>Select Role</InputLabel>
                    <Select value={role} onChange={(e) => setRole(e.target.value)} label="Select Role">
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
                      mb: 1,
                      py: 1.5,
                      backgroundColor: '#4CAF50',
                      '&:hover': { backgroundColor: '#2E7D32' }
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                  </Button>
                  <Button
  fullWidth
  variant="outlined"
  size="large"
  onClick={() => navigate('/register')}
  sx={{
    py: 1.5,
    borderColor: '#4CAF50',
    color: '#4CAF50',
    '&:hover': {
      borderColor: '#2E7D32',
      color: '#2E7D32'
    }
  }}
>
  New here? Register
</Button>

                </Box>
              </Paper>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default LoginScreen;