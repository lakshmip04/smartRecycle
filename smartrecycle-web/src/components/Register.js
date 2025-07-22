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
  ToggleButtonGroup,
  ToggleButton,
  Collapse,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

// Renamed component to Register
const Register = () => {
  // State for registration form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(''); // Default role

  // Role-specific state
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState('');
  
  // New state for multi-select dropdown
  const [acceptedWaste, setAcceptedWaste] = useState([]);

  // General UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  // List of waste types for the dropdown
  const wasteTypes = [
    'electronic', 'plastic', 'metal', 'medical', 'paper', 'organic', 'glass', 'textile', 'hazardous', 'mass collect'
  ];

  // Particle engine initialization
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  // --- Mock Registration Logic ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);

    // Simulate an API call
    setTimeout(() => {
      setLoading(false);
      setSuccess("Registration successful! Redirecting to login...");
      
      setFadeOut(true);
      setTimeout(() => {
        navigate('/login'); // Navigate to your login route
      }, 1500);
    }, 1500);
  };

  // --- Handler for the multi-select dropdown ---
  const handleWasteTypeChange = (event) => {
    const {
      target: { value },
    } = event;
    setAcceptedWaste(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
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
                zIndex: 1,
                py: 4
              }}
            >
              <Paper
                elevation={12}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: 4,
                  textAlign: 'center',
                  backdropFilter: 'blur(8px)',
                  background: 'rgba(255,255,255,0.92)',
                  width: '100%',
                  maxWidth: '480px'
                }}
              >
                <Typography variant="h3" gutterBottom sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  EcoDrop
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Create an Account
                </Typography>

                <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
                  {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                  {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                  
                  {/* --- BASIC DETAILS FIRST --- */}
                  <TextField fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} margin="normal" />
                  <TextField fullWidth label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" />
                  <TextField fullWidth label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} margin="normal" />
                  <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" />
                  <TextField fullWidth label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} margin="normal" />

                  {/* --- ROLE SELECTION NEXT --- */}
                  <ToggleButtonGroup
                      color="primary"
                      value={role}
                      exclusive
                      onChange={(e, newRole) => { if (newRole) setRole(newRole);}}
                      fullWidth
                      sx={{ my: 2 }}
                  >
                      <ToggleButton value="user">👤 I want to dispose waste</ToggleButton>
                      <ToggleButton value="collector">🚛 I am a waste collector</ToggleButton>
                  </ToggleButtonGroup>

                  {/* --- User/Household Specific Fields --- */}
                  <Collapse in={role === 'user'}>
                      <Divider sx={{ my: 2 }}>User Details</Divider>
                      <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={dob} onChange={(e) => setDob(e.target.value)} margin="normal" />
                      <TextField fullWidth label="Home Address" multiline rows={2} value={address} onChange={(e) => setAddress(e.target.value)} margin="normal" />
                  </Collapse>

                  {/* --- Collector Specific Fields --- */}
                  <Collapse in={role === 'collector'}>
                      <Divider sx={{ my: 2 }}>Collector Details</Divider>
                      <TextField fullWidth label="Service Area Address" multiline rows={2} value={address} onChange={(e) => setAddress(e.target.value)} margin="normal" />
                      <TextField fullWidth label="Vehicle Details (e.g., Tata Ace - KA-01-1234)" value={vehicleDetails} onChange={(e) => setVehicleDetails(e.target.value)} margin="normal" />
                      
                      {/* --- MULTI-SELECT DROPDOWN --- */}
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Accepted Waste Types</InputLabel>
                        <Select
                          multiple
                          value={acceptedWaste}
                          onChange={handleWasteTypeChange}
                          input={<OutlinedInput label="Accepted Waste Types" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} />
                              ))}
                            </Box>
                          )}
                        >
                          {wasteTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              <Checkbox checked={acceptedWaste.indexOf(type) > -1} />
                              <ListItemText primary={type} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
                          Upload Identity Document
                          <input type="file" hidden />
                      </Button>
                  </Collapse>

                  <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, mb: 1, py: 1.5, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                  </Button>
                  <Button fullWidth variant="text" onClick={() => navigate('/login')}>
                    Already have an account? Sign In
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

export default Register;
