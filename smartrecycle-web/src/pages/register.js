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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Card,
  CardContent,
} from '@mui/material';
import {
  ExpandMore,
  Nature,
  Recycling,
  ReportProblem,
} from '@mui/icons-material';
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

  // Hierarchical waste type structure
  const wasteCategories = {
    organicWaste: {
      title: "Organic Waste (Green Bin)",
      description: "Biodegradable waste from kitchen and garden",
      subcategories: {
        kitchenWaste: {
          title: "Kitchen Waste",
          items: [
            "Cooked food and leftovers",
            "Uncooked kitchen scraps", 
            "Fruit and vegetable peels",
            "Rotten fruits and vegetables",
            "Eggshells",
            "Chicken and fish bones",
            "Tissue paper soiled with food",
            "Used tea bags and coffee grounds",
            "Leaf plates"
          ]
        },
        gardenWaste: {
          title: "Garden Waste",
          items: [
            "Pooja flowers and garlands",
            "Garden sweepings (fallen leaves, twigs, etc.)",
            "Weeds"
          ]
        }
      }
    },
    dryWaste: {
      title: "Dry Waste (Blue Bag/Bin)",
      description: "Non-biodegradable, recyclable materials. All containers should be rinsed and dry before disposal.",
      subcategories: {
        plastic: {
          title: "Plastic",
          items: [
            "Plastic covers, bottles, boxes, and other items",
            "Milk and curd packets",
            "Chips, biscuit, and toffee wrappers",
            "Plastic cups"
          ]
        },
        paper: {
          title: "Paper",
          items: [
            "Newspapers and magazines",
            "Cardboard cartons and pizza boxes",
            "Tetra Paks (juice/milk cartons)",
            "Paper cups and plates",
            "Stationery and junk mail"
          ]
        },
        metal: {
          title: "Metal",
          items: [
            "Foil containers",
            "Metal cans (beverage, food cans)"
          ]
        },
        glass: {
          title: "Glass",
          items: [
            "Unbroken glass bottles and jars (Handle with care)"
          ]
        },
        otherDryWaste: {
          title: "Other Dry Waste",
          items: [
            "Rubber and Thermocol (Styrofoam)",
            "Old mops, dusters, and sponges",
            "Coconut shells",
            "Hair",
            "Ceramics and wooden chips",
            "Used cosmetics containers"
          ]
        },
        eWaste: {
          title: "E-waste (Electronic Waste)",
          description: "Hazardous - store separately and give to certified e-waste recycler",
          items: [
            "Batteries",
            "CDs and Tapes",
            "Thermometers"
          ]
        },
        bulbsLighting: {
          title: "Bulbs & Lighting",
          description: "Handle with care as these are hazardous",
          items: [
            "Bulbs, Tube lights, and CFLs"
          ]
        },
        constructionDebris: {
          title: "Construction Debris & Inerts",
          description: "Never mix with regular waste. Check with local municipality for collection services",
          items: [
            "Rubble and bricks",
            "Paints",
            "Silt from drains",
            "Cement powder",
            "Broken glass",
            "Flower pots (clay/ceramic)"
          ]
        }
      }
    },
    sanitaryWaste: {
      title: "Sanitary / Reject Waste (Red Bin)",
      description: "Non-recyclable and hazardous household waste that must be disposed of carefully",
      subcategories: {
        general: {
          title: "General Sanitary Waste",
          items: [
            "Diapers and sanitary napkins",
            "Bandages, used masks, and gloves",
            "Contaminated cotton, gauze, or used tissues",
            "Condoms",
            "Expired or unused medicines",
            "Nails",
            "Swept dust",
            "Cigarette butts"
          ]
        },
        sharps: {
          title: "Sharps",
          description: "All sharp objects MUST be wrapped carefully and thickly in newspaper or placed in a puncture-proof box before disposal",
          items: [
            "Razors and blades",
            "Syringes",
            "Injection vials"
          ]
        }
      }
    }
  };

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
    if (role === 'COLLECTOR' && acceptedWasteTypes.length === 0) {
        setError("Please select at least one waste type that you can collect.");
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
        registrationData.acceptedWasteTypes = mapToEnumWasteTypes(acceptedWasteTypes); // Convert to enum values
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

  const getCategoryIcon = (categoryKey) => {
    const icons = {
      organicWaste: <Nature sx={{ color: '#4CAF50' }} />,
      dryWaste: <Recycling sx={{ color: '#2196F3' }} />,
      sanitaryWaste: <ReportProblem sx={{ color: '#F44336' }} />
    };
    return icons[categoryKey] || <Nature />;
  };

  const getCategoryColor = (categoryKey) => {
    const colors = {
      organicWaste: '#4CAF50',
      dryWaste: '#2196F3', 
      sanitaryWaste: '#F44336'
    };
    return colors[categoryKey] || '#4CAF50';
  };

  const handleSubcategoryChange = (categoryKey, subcategoryKey, isChecked) => {
    const wasteTypeKey = `${categoryKey}.${subcategoryKey}`;
    
    if (isChecked) {
      setAcceptedWasteTypes(prev => [...prev, wasteTypeKey]);
    } else {
      setAcceptedWasteTypes(prev => prev.filter(type => type !== wasteTypeKey));
    }
  };

  const isSubcategorySelected = (categoryKey, subcategoryKey) => {
    const wasteTypeKey = `${categoryKey}.${subcategoryKey}`;
    return acceptedWasteTypes.includes(wasteTypeKey);
  };

  // Map hierarchical waste types to Prisma enum values
  const mapToEnumWasteTypes = (hierarchicalTypes) => {
    const mapping = {
      // Organic waste maps to ORGANIC
      'organicWaste.kitchenWaste': 'ORGANIC',
      'organicWaste.gardenWaste': 'ORGANIC',
      
      // Dry waste subcategories map to different enums
      'dryWaste.plastic': 'RECYCLABLE',
      'dryWaste.paper': 'RECYCLABLE', 
      'dryWaste.metal': 'RECYCLABLE',
      'dryWaste.glass': 'RECYCLABLE',
      'dryWaste.otherDryWaste': 'GENERAL',
      'dryWaste.eWaste': 'E_WASTE',
      'dryWaste.bulbsLighting': 'HAZARDOUS',
      'dryWaste.constructionDebris': 'CONSTRUCTION_DEBRIS',
      
      // Sanitary waste maps to different categories
      'sanitaryWaste.general': 'GENERAL',
      'sanitaryWaste.sharps': 'MEDICAL'
    };

    // Convert hierarchical selections to enum values and remove duplicates
    const enumTypes = hierarchicalTypes
      .map(type => mapping[type])
      .filter(Boolean) // Remove undefined values
      .filter((value, index, array) => array.indexOf(value) === index); // Remove duplicates

    return enumTypes;
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
                                <Box sx={{ mt: 2, mb: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Accepted Waste Types *
                                    </Typography>
                                    {acceptedWasteTypes.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                                Selected waste types:
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                                {acceptedWasteTypes.map((wasteType) => {
                                                    const [category, subcategory] = wasteType.split('.');
                                                    const categoryData = wasteCategories[category];
                                                    const subcategoryData = categoryData?.subcategories[subcategory];
                                                    return (
                                                        <Chip 
                                                            key={wasteType} 
                                                            label={subcategoryData?.title || wasteType}
                                                            size="small"
                                                            sx={{ 
                                                                backgroundColor: getCategoryColor(category) + '20',
                                                                color: getCategoryColor(category),
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                System categories: {mapToEnumWasteTypes(acceptedWasteTypes).join(', ')}
                                            </Typography>
                                        </Box>
                                    )}
                                    
                                    {Object.entries(wasteCategories).map(([categoryKey, categoryData]) => (
                                        <Accordion 
                                            key={categoryKey} 
                                            sx={{ 
                                                mb: 1, 
                                                border: `1px solid ${getCategoryColor(categoryKey)}20`,
                                                borderRadius: 2,
                                                '&:before': { display: 'none' }
                                            }}
                                        >
                                            <AccordionSummary 
                                                expandIcon={<ExpandMore />}
                                                sx={{ 
                                                    borderLeft: `4px solid ${getCategoryColor(categoryKey)}`,
                                                    '& .MuiAccordionSummary-content': {
                                                        alignItems: 'center'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    {getCategoryIcon(categoryKey)}
                                                    <Box>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                            {categoryData.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {categoryData.description}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ pt: 0 }}>
                                                <FormGroup>
                                                    {Object.entries(categoryData.subcategories).map(([subcategoryKey, subcategoryData]) => (
                                                        <Card 
                                                            key={subcategoryKey} 
                                                            variant="outlined" 
                                                            sx={{ 
                                                                mb: 1.5, 
                                                                borderColor: isSubcategorySelected(categoryKey, subcategoryKey) 
                                                                    ? getCategoryColor(categoryKey) 
                                                                    : 'rgba(0,0,0,0.12)',
                                                                backgroundColor: isSubcategorySelected(categoryKey, subcategoryKey)
                                                                    ? getCategoryColor(categoryKey) + '08'
                                                                    : 'transparent'
                                                            }}
                                                        >
                                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            checked={isSubcategorySelected(categoryKey, subcategoryKey)}
                                                                            onChange={(e) => handleSubcategoryChange(categoryKey, subcategoryKey, e.target.checked)}
                                                                            sx={{ color: getCategoryColor(categoryKey) }}
                                                                        />
                                                                    }
                                                                    label={
                                                                        <Box>
                                                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                                                                {subcategoryData.title}
                                                                            </Typography>
                                                                            {subcategoryData.description && (
                                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontStyle: 'italic' }}>
                                                                                    {subcategoryData.description}
                                                                                </Typography>
                                                                            )}
                                                                            <Box sx={{ mt: 1 }}>
                                                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                                                                    Items include:
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                                                    {subcategoryData.items.slice(0, 3).join(', ')}
                                                                                    {subcategoryData.items.length > 3 && `, and ${subcategoryData.items.length - 3} more...`}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                    }
                                                                    sx={{ alignItems: 'flex-start', m: 0 }}
                                                                />
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </FormGroup>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Box>
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
