import React, { useState } from 'react';
import { useRouter } from 'next/router'; // Use Next.js router
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
import { supabase } from '../lib/supabaseClient'; // Import the supabase client

export default function RegisterPage() {
  const router = useRouter();

  // --- State for all form fields ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(''); // 'HOUSEHOLD' or 'COLLECTOR'

  // Role-specific state
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [acceptedWasteTypes, setAcceptedWasteTypes] = useState([]);
  const [identityDocument, setIdentityDocument] = useState(null); // State for the file
  
  // General UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fadeOut, setFadeOut] = useState(false);

  // Waste types must match the Prisma Enum
  const wasteTypeOptions = [
    'GENERAL', 'RECYCLABLE', 'E_WASTE', 'ORGANIC', 'HAZARDOUS', 'CONSTRUCTION_DEBRIS', 'MEDICAL'
  ];

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
        setIdentityDocument(event.target.files[0]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!role) {
        setError("Please select a role.");
        return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (role === 'COLLECTOR' && !identityDocument) {
        setError("Please upload an identity document.");
        return;
    }
    setLoading(true);

    let documentUrl = '';

    // --- Step 1: Handle File Upload if Collector ---
    if (role === 'COLLECTOR' && identityDocument) {
        try {
            const fileExt = identityDocument.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `public/${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from('identity-documents') // The name of your storage bucket
                .upload(filePath, identityDocument);

            if (uploadError) {
                throw uploadError;
            }
            
            // Get the public URL of the uploaded file
            const { data } = supabase.storage
                .from('identity-documents')
                .getPublicUrl(filePath);

            if (!data.publicUrl) {
                throw new Error("Could not get public URL for the document.");
            }
            documentUrl = data.publicUrl;

        } catch (uploadError) {
            setError(`File Upload Failed: ${uploadError.message}`);
            setLoading(false);
            return;
        }
    }

    // --- Step 2: Build the data payload for the API ---
    let registrationData = {
        name, email, phone, password, role, address,
        latitude: 12.9716, longitude: 77.5946,
    };

    if (role === 'HOUSEHOLD') {
        registrationData.dateOfBirth = dateOfBirth;
    } else if (role === 'COLLECTOR') {
        registrationData.vehicleDetails = vehicleDetails;
        registrationData.acceptedWasteTypes = acceptedWasteTypes;
        registrationData.identityDocumentUrl = documentUrl; // Use the real URL
    }

    // --- Step 3: Call the registration API ---
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData),
        });

        const result = await response.json();

        if (response.ok) {
            setSuccess("Registration successful! Redirecting to login...");
            setFadeOut(true);
            setTimeout(() => {
                router.push('/');
            }, 1500);
        } else {
            setError(result.message || 'An error occurred during registration.');
        }
    } catch (err) {
        setError('Could not connect to the server. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const handleWasteTypeChange = (event) => {
    const { target: { value } } = event;
    setAcceptedWasteTypes(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
        <Particles id="tsparticles" init={particlesInit} options={{ background: { color: { value: '#ffffff00' } }, fpsLimit: 60, interactivity: { events: { onHover: { enable: true, mode: 'repulse' } }, modes: { repulse: { distance: 100 } } }, particles: { color: { value: '#4CAF50' }, links: { enable: true, color: '#4CAF50', distance: 150 }, move: { enable: true, speed: 2 }, size: { value: { min: 1, max: 3 } }, number: { value: 60 } } }} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} />
        <AnimatePresence>
            {!fadeOut && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.7 }}>
                <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, py: 4 }}>
                    <Paper elevation={12} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, textAlign: 'center', backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.92)', width: '100%', maxWidth: '480px' }}>
                        <Typography variant="h3" gutterBottom sx={{ color: '#4CAF50', fontWeight: 'bold' }}>SmartRecycle</Typography>
                        <Typography variant="h6" gutterBottom>Create an Account</Typography>
                        <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                            <TextField fullWidth required label="Full Name" value={name} onChange={(e) => setName(e.target.value)} margin="normal" />
                            <TextField fullWidth required label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" />
                            <TextField fullWidth required label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} margin="normal" />
                            <TextField fullWidth required label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" />
                            <TextField fullWidth required label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} margin="normal" />
                            <ToggleButtonGroup color="primary" value={role} exclusive onChange={(e, newRole) => { if (newRole) setRole(newRole);}} fullWidth sx={{ my: 2 }}>
                                <ToggleButton value="HOUSEHOLD">👤 I want to dispose waste</ToggleButton>
                                <ToggleButton value="COLLECTOR">🚛 I am a waste collector</ToggleButton>
                            </ToggleButtonGroup>
                            <Collapse in={role === 'HOUSEHOLD'}>
                                <Divider sx={{ my: 2 }}>User Details</Divider>
                                <TextField fullWidth required={role === 'HOUSEHOLD'} label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} margin="normal" />
                                <TextField fullWidth required={role === 'HOUSEHOLD'} label="Home Address" multiline rows={2} value={address} onChange={(e) => setAddress(e.target.value)} margin="normal" />
                            </Collapse>
                            <Collapse in={role === 'COLLECTOR'}>
                                <Divider sx={{ my: 2 }}>Collector Details</Divider>
                                <TextField fullWidth required={role === 'COLLECTOR'} label="Service Area Address" multiline rows={2} value={address} onChange={(e) => setAddress(e.target.value)} margin="normal" />
                                <TextField fullWidth label="Vehicle Details" value={vehicleDetails} onChange={(e) => setVehicleDetails(e.target.value)} margin="normal" />
                                <FormControl fullWidth margin="normal" required={role === 'COLLECTOR'}>
                                    <InputLabel>Accepted Waste Types</InputLabel>
                                    <Select multiple value={acceptedWasteTypes} onChange={handleWasteTypeChange} input={<OutlinedInput label="Accepted Waste Types" />} renderValue={(selected) => (<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map((value) => (<Chip key={value} label={value.replace('_', ' ')} />))}</Box>)}>
                                        {wasteTypeOptions.map((type) => (<MenuItem key={type} value={type}><Checkbox checked={acceptedWasteTypes.indexOf(type) > -1} /><ListItemText primary={type.replace('_', ' ')} /></MenuItem>))}
                                    </Select>
                                </FormControl>
                                <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
                                    {identityDocument ? `File: ${identityDocument.name}` : 'Upload Identity Document'}
                                    <input type="file" hidden onChange={handleFileSelect} />
                                </Button>
                            </Collapse>
                            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mt: 3, mb: 1, py: 1.5, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                            </Button>
                            <Button fullWidth variant="text" onClick={() => router.push('/')}>
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
}
