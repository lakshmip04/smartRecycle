import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  PhotoCamera,
  Upload,
  Recycling,
  Delete,
  CheckCircle,
  Cancel,
  Close,
  Info,
  Nature,
  Warning,
  Science,
  LocationOn,
} from '@mui/icons-material';
import LocationAutocomplete from './LocationAutocomplete';

const WasteClassifier = ({ onClassificationComplete, showInternalResults = true }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [classificationResult, setClassificationResult] = useState({
    waste_type: '',
    biodegradability: '',
    confidence: 0,
    recycling_instructions: '',
    environmental_impact: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [resultKey, setResultKey] = useState(0); // Add a key to force re-render
  
  // Location state management
  const [locationData, setLocationData] = useState({
    address: '',
    latitude: null,
    longitude: null
  });
  const [showLocationSection, setShowLocationSection] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Cloudflare Worker Configuration
  const WORKER_URL = "https://gemini-worker.lakshmi20041304.workers.dev";

  const classificationPrompt = `
You are a waste classification assistant.
Given an image, classify it into:
1. If the image contains a human person (avoid human if seen partially), classify as "human"
2. If it's actual waste, classify into one of: plastic, metal, medical, paper, electronic, organic, glass, textile, hazardous
3. For biodegradability: biodegradable or non-biodegradable

Return your answer in this JSON format:
{
  "waste_type": "plastic",
  "biodegradability": "non-biodegradable",
  "confidence": 95,
  "recycling_instructions": "Clean and place in recycling bin",
  "environmental_impact": "High - takes 450+ years to decompose"
}

IMPORTANT: If you detect a human with eyes and face in the image, respond with:
{
  "waste_type": "human",
  "biodegradability": "biodegradable",
  "confidence": 100,
  "recycling_instructions": "Not applicable",
  "environmental_impact": "Not applicable"
}

Only return the JSON.
`;

  // Add useEffect to log state changes
  useEffect(() => {
    console.log("🔄 useEffect triggered, classificationResult:", classificationResult);
    if (classificationResult && classificationResult.waste_type) {
      console.log("✅ Classification result updated:", classificationResult);
      console.log("✅ Classification result keys:", Object.keys(classificationResult));
      console.log("✅ Waste type:", classificationResult.waste_type);
      
      // Special logging for human detection
      if (classificationResult.waste_type === 'human') {
        console.log("🚨 HUMAN DETECTED - Alert should be shown!");
      }
    } else {
      console.log("⚠️ Classification result is empty (initial state or reset)");
      console.log("⚠️ Current state:", classificationResult);
    }
  }, [classificationResult]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setShowCamera(true);
      setError('');

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (error) {
      console.error('Camera error:', error);
      setError('Camera access denied or not available. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          processImageFile(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handleCameraCapture = () => {
    startCamera();
  };

  const processImageFile = (file) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
         setClassificationResult({
       waste_type: '',
       biodegradability: '',
       confidence: 100,
       recycling_instructions: '',
       environmental_impact: ''
     });
      setError('');
      setResultKey(prev => prev + 1); // Increment key to force re-render
  };

  const classifyWaste = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const base64Image = await convertToBase64(selectedImage);

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: classificationPrompt
              },
              {
                inline_data: {
                  mime_type: selectedImage.type,
                  data: base64Image.split(',')[1]
                }
              }
            ]
          }
        ]
      };

      console.log("Sending request to Worker...");
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Worker request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Worker response received:", data);

      if (!data.content) {
        throw new Error('Invalid Worker response format');
      }

      const resultText = data.content;
      console.log("Result text:", resultText);

      // Parse JSON response
      let result;
      try {
        const cleanedText = resultText.replace(/```json|```/g, '').trim();
        result = JSON.parse(cleanedText);
        console.log("Parsed result:", result);
      } catch (parseError) {
        console.error("Failed to parse API response:", parseError);
        throw new Error('Failed to parse API response');
      }

      // Update state with the result
      console.log("🔄 Setting classification result:", result);
      console.log("🔄 Waste type detected:", result.waste_type);
      
      // Directly set the result instead of using spread operator
      setClassificationResult({
        waste_type: result.waste_type,
        biodegradability: result.biodegradability,
        confidence: result.confidence,
        recycling_instructions: result.recycling_instructions,
        environmental_impact: result.environmental_impact
      });
      setResultKey(prev => prev + 1); // Increment key to force re-render

      // Special check for human detection
      if (result.waste_type === 'human') {
        console.log("🚨 HUMAN WASTE TYPE DETECTED! Alert should appear.");
      }

      // Callback to parent component
      if (onClassificationComplete) {
        console.log("📤 Calling onClassificationComplete with result");
        onClassificationComplete({
          image: selectedImage,
          classification: result,
          location: locationData
        });
      }
    } catch (error) {
      console.error('Classification error:', error);
      setError(`Failed to classify waste: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const getWasteTypeColor = (wasteType) => {
    const colors = {
      plastic: '#ff5722',
      metal: '#607d8b',
      paper: '#8bc34a',
      electronic: '#3f51b5',
      organic: '#4caf50',
      glass: '#00bcd4',
      textile: '#9c27b0',
      hazardous: '#f44336'
    };
    return colors[wasteType] || '#757575';
  };

  const getBiodegradabilityColor = (biodegradability) => {
    return biodegradability === 'biodegradable' ? '#4caf50' : '#ff5722';
  };

  const getWasteTypeIcon = (wasteType) => {
    const icons = {
      plastic: '🥤',
      metal: '🔧',
      paper: '📄',
      electronic: '📱',
      organic: '🍃',
      glass: '🍾',
      textile: '👕',
      hazardous: '☢️',
      human: '👤'
    };
    return icons[wasteType] || '♻️';
  };

  const handleLocationSelect = (location) => {
    setLocationData({
      address: location.description,
      latitude: location.latitude,
      longitude: location.longitude
    });
  };

  const resetClassifier = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setClassificationResult({
        waste_type: '',
        biodegradability: '',
        confidence: 100,
        recycling_instructions: '',
        environmental_impact: ''
    });
    setLocationData({
      address: '',
      latitude: null,
      longitude: null
    });
    setShowLocationSection(false);
    setError('');
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
    setResultKey(prev => prev + 1); // Increment key to force re-render
  };



  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Recycling sx={{ mr: 1, color: 'primary.main' }} />
            AI Waste Classifier
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Upload or capture an image to classify waste type and biodegradability
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Upload />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ py: 1.5 }}
              >
                Upload Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PhotoCamera />}
                onClick={handleCameraCapture}
                sx={{ py: 1.5 }}
              >
                Capture Image
              </Button>
            </Grid>
          </Grid>

          {/* Camera View */}
          {showCamera && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  display: 'inline-block',
                  borderRadius: 2,
                  maxWidth: '100%',
                  position: 'relative'
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    maxWidth: '400px',
                    maxHeight: '300px',
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px'
                  }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                />
                <IconButton
                  onClick={stopCamera}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.7)',
                    }
                  }}
                  size="small"
                >
                  <Close />
                </IconButton>
              </Paper>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={capturePhoto}
                  startIcon={<PhotoCamera />}
                  sx={{ mr: 1 }}
                >
                  Take Photo
                </Button>
                <Button
                  variant="outlined"
                  onClick={stopCamera}
                  color="error"
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}

          {imagePreview && !showCamera && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  display: 'inline-block',
                  borderRadius: 2,
                  maxWidth: '100%'
                }}
              >
                <img
                  src={imagePreview}
                  alt="Selected waste"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '300px',
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px'
                  }}
                />
              </Paper>

              {/* Location Selection Section */}
              <Box sx={{ mt: 3, textAlign: 'left', maxWidth: '500px', mx: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                  <LocationOn sx={{ mr: 1 }} />
                  Pickup Location
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Select the location where this waste item is located for pickup
                </Typography>
                <LocationAutocomplete
                  value={locationData.address}
                  onSelect={handleLocationSelect}
                  label="Pickup Address"
                  placeholder="Enter pickup address..."
                  required={true}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={classifyWaste}
                  disabled={loading || !locationData.address}
                  startIcon={loading ? <CircularProgress size={20} /> : <Recycling />}
                  sx={{ mr: 1 }}
                >
                  {loading ? 'Analyzing...' : 'Classify Waste'}
                </Button>
                <IconButton onClick={resetClassifier} color="error">
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

             {/* AI Waste Classifier Results Card - Always shown but with empty fields initially */}
       {showInternalResults && (
         <Card elevation={3} sx={{ mb: 3 }} key={resultKey}>
         <CardContent>
           <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
             <Science sx={{ mr: 1, color: 'primary.main' }} />
             Classification Results
             {classificationResult.waste_type && (
               <Typography variant="caption" sx={{ ml: 2, bgcolor: 'success.light', px: 1, py: 0.5, borderRadius: 1 }}>
                 Results Available
               </Typography>
             )}
           </Typography>

                     {/* Show analyzed image when results are available */}
           {imagePreview && classificationResult.waste_type && (
             <Box sx={{ mb: 3, textAlign: 'center' }}>
               <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                 📸 Analyzed Image
               </Typography>
               <Paper elevation={2} sx={{ p: 2, display: 'inline-block', borderRadius: 2 }}>
                 <img
                   src={imagePreview}
                   alt="Analyzed waste"
                   style={{
                     maxWidth: '300px',
                     maxHeight: '300px',
                     width: '100%',
                     height: 'auto',
                     borderRadius: '8px'
                   }}
                 />
               </Paper>
             </Box>
           )}

           {/* Human Detection Warning - shown only when human is detected */}
           {classificationResult.waste_type === 'human' && (
             <>
               {console.log("🚨 RENDERING HUMAN DETECTION ALERT!")}
               <Alert 
                 severity="error" 
                 sx={{ mb: 3, fontWeight: 'bold', border: '2px solid #f44336' }}
                 icon={<Warning fontSize="large" />}
               >
                 <Typography variant="h6" gutterBottom sx={{ color: '#d32f2f' }}>
                   🚨 Human Detected in Image
                 </Typography>
                 <Typography variant="body1">
                   Please upload images of waste materials only. The AI has detected a human in this image. 
                   For proper waste classification, please capture or upload images containing only waste items 
                   (plastic, metal, paper, electronics, etc.).
                 </Typography>
               </Alert>
             </>
           )}

          {/* Classification Results Grid - shown always but with empty fields initially */}
          <Box sx={{
            bgcolor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            p: 3,
            mb: 2
          }}>
            <Grid container spacing={2}>
              {/* Waste Type */}
                              <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      Waste Type:
                    </Typography>
                    {classificationResult.waste_type ? (
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#d63384' }}>
                        "{classificationResult.waste_type}"
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        Not classified yet
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Biodegradability */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      Biodegradability:
                    </Typography>
                    {classificationResult.biodegradability ? (
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#d63384' }}>
                        "{classificationResult.biodegradability}"
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        Not analyzed yet
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Confidence */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      Confidence:
                    </Typography>
                    {classificationResult.confidence !== undefined && classificationResult.waste_type ? (
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#0d6efd' }}>
                        {classificationResult.confidence}%
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        Not analyzed yet
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Environmental Impact */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      Environmental Impact:
                    </Typography>
                    {classificationResult.environmental_impact ? (
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#d63384' }}>
                        "{classificationResult.environmental_impact}"
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        Not analyzed yet
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Recycling Instructions */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      Recycling Instructions:
                    </Typography>
                    {classificationResult.recycling_instructions ? (
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#d63384' }}>
                        "{classificationResult.recycling_instructions}"
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                        Not analyzed yet
                      </Typography>
                    )}
                  </Box>
                </Grid>
            </Grid>
          </Box>

          {/* Enhanced Visual Results - shown only when there are results and not human */}
          {classificationResult.waste_type && classificationResult.waste_type !== 'human' && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Science sx={{ mr: 1, fontSize: 24 }} />
                  Enhanced Classification Details
                </Typography>
              </Box>

              {/* Main Results Grid */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {/* Waste Type */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Waste Type
                    </Typography>
                    <Box sx={{ fontSize: '2rem', mb: 1 }}>
                      {getWasteTypeIcon(classificationResult.waste_type)}
                    </Box>
                    <Chip
                      label={classificationResult.waste_type?.toUpperCase()}
                      sx={{
                        bgcolor: getWasteTypeColor(classificationResult.waste_type),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        py: 1,
                        px: 2
                      }}
                    />
                  </Paper>
                </Grid>

                {/* Biodegradability */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Biodegradability
                    </Typography>
                    <Box sx={{ fontSize: '2rem', mb: 1 }}>
                      {classificationResult.biodegradability === 'biodegradable' ? '🌱' : '🚫'}
                    </Box>
                    <Chip
                      label={classificationResult.biodegradability?.toUpperCase()}
                      icon={classificationResult.biodegradability === 'biodegradable' ? <CheckCircle /> : <Cancel />}
                      sx={{
                        bgcolor: getBiodegradabilityColor(classificationResult.biodegradability),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        py: 1,
                        px: 2
                      }}
                    />
                  </Paper>
                </Grid>
              </Grid>

              {/* Confidence Level */}
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Science sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                  AI Confidence Level
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main', mr: 1 }}>
                    {classificationResult.confidence}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={classificationResult.confidence}
                    sx={{
                      flexGrow: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: classificationResult.confidence >= 80 ? 'success.main' :
                               classificationResult.confidence >= 60 ? 'warning.main' : 'error.main'
                      }
                    }}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {classificationResult.confidence >= 80 ? 'High confidence classification' :
                   classificationResult.confidence >= 60 ? 'Medium confidence classification' :
                   'Low confidence - manual verification recommended'}
                </Typography>
              </Paper>

              {/* Detailed Information */}
              <Grid container spacing={2}>
                {/* Recycling Instructions */}
                {classificationResult.recycling_instructions && (
                  <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Recycling sx={{ mr: 1, color: 'info.main', fontSize: 20 }} />
                        Recycling Instructions
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Info color="info" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={classificationResult.recycling_instructions}
                            primaryTypographyProps={{ color: 'info.main', variant: 'body2' }}
                          />
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>
                )}

                {/* Environmental Impact */}
                {classificationResult.environmental_impact && (
                  <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Nature sx={{ mr: 1, color: 'warning.main', fontSize: 20 }} />
                        Environmental Impact
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Warning color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={classificationResult.environmental_impact}
                            primaryTypographyProps={{ color: 'warning.main', variant: 'body2' }}
                          />
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Action Buttons - shown only when there are results */}
          {classificationResult.waste_type && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                size="medium"
                onClick={resetClassifier}
                startIcon={<Recycling />}
                sx={{ mr: 1 }}
              >
                Classify Another Item
              </Button>
              <Button
                variant="outlined"
                size="medium"
                onClick={() => setOpen(true)}
                startIcon={<Info />}
                color="secondary"
              >
                View Raw JSON
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
      )}

      {/* Detailed Results Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Science sx={{ mr: 1 }} />
            Technical Classification Data
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {classificationResult.waste_type && (
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Raw API Response:
              </Typography>
              <pre style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '14px',
                overflow: 'auto',
                border: '1px solid #ddd'
              }}>
                {JSON.stringify(classificationResult, null, 2)}
              </pre>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WasteClassifier;
