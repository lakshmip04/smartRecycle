import React, { useState } from 'react';
import { useRouter } from 'next/router'; // Import Next.js router
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  ToggleButtonGroup, // Added for role selector
  ToggleButton,      // Added for role selector
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

// This is now your main Login Page component
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('HOUSEHOLD'); // Added state for role selection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const router = useRouter(); // Initialize the Next.js router

  // Particle engine initialization
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  // Helper function to determine where to redirect based on user role
  const getRedirectPath = (userRole) => {
    switch (userRole) {
      case 'ADMIN':
        return '/admin-dashboard';
      case 'HOUSEHOLD':
        return '/user-dashboard';
      case 'COLLECTOR':
        return '/collector-dashboard';
      default:
        return '/';
    }
  };

  // This function now calls your real backend API
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use fetch to call the login API endpoint we created
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login was successful
        console.log('Login successful:', data.user);
        
        // Store user data and selected role in localStorage
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem('selected_role', role); // Store the selected role
        
        // Trigger the success animation and redirect
        setFadeOut(true);
        setTimeout(() => {
          const redirectPath = getRedirectPath(data.user.role);
          router.push(redirectPath);
        }, 800);

      } else {
        // Handle errors from the API
        setError(data.message || 'An error occurred during login.');
        setLoading(false);
      }
    } catch (err) {
      // Handle network errors
      setError('Could not connect to the server. Please try again later.');
      setLoading(false);
    }
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
                  SmartRecycle
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                  Login to continue
                </Typography>

                <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {/* MODIFIED: Added Role Selector */}
                  <ToggleButtonGroup
                    color="primary"
                    value={role}
                    exclusive
                    onChange={(e, newRole) => { if (newRole) setRole(newRole);}}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton value="HOUSEHOLD">👤 User</ToggleButton>
                    <ToggleButton value="COLLECTOR">🚛 Collector</ToggleButton>
                  </ToggleButtonGroup>

                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    required
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
                    onClick={() => router.push('/register')}
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
}
