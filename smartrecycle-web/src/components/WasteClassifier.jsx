import React, { useState, useRef } from 'react';
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
} from '@mui/material';
import {
  PhotoCamera,
  Upload,
  Recycling,
  Delete,
  CheckCircle,
  Cancel,
  Close,
} from '@mui/icons-material';

const WasteClassifier = ({ onClassificationComplete }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [classificationResult, setClassificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Google Gemini AI Configuration
  const GEMINI_API_KEY = "AIzaSyC5Ob_itc0pBnopyBxUohxf58fg6muf8RE"; // Your API key
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const classificationPrompt = `
You are a waste classification assistant.

Given an image of a waste item, classify it into:
1. Biodegradable or Non-biodegradable
2. One of: plastic, metal, paper, electronic, organic, glass, textile, hazardous

Return your answer in this JSON format:
{
  "waste_type": "plastic",
  "biodegradability": "non-biodegradable",
  "confidence": 95,
  "recycling_instructions": "Clean and place in recycling bin",
  "environmental_impact": "High - takes 450+ years to decompose"
}
Only return the JSON.
`;

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
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setShowCamera(true);
      setError('');
      
      // Wait for video element to be available
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
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
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
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Reset previous results
    setClassificationResult(null);
    setError('');
  };

  const classifyWaste = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert image to base64
      const base64Image = await convertToBase64(selectedImage);
      
      // Prepare request for Google Gemini
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
                  data: base64Image.split(',')[1] // Remove data:image/jpeg;base64, prefix
                }
              }
            ]
          }
        ]
      };

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const resultText = data.candidates[0].content.parts[0].text;
      
      // Parse JSON response
      const cleanedText = resultText.replace(/```json|```/g, '').trim();
      const result = JSON.parse(cleanedText);
      
      setClassificationResult(result);
      
      // Callback to parent component
      if (onClassificationComplete) {
        onClassificationComplete({
          image: selectedImage,
          classification: result
        });
      }

    } catch (error) {
      console.error('Classification error:', error);
      setError('Failed to classify waste. Please try again.');
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

  const resetClassifier = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setClassificationResult(null);
    setError('');
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
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
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={classifyWaste}
                  disabled={loading}
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

          {classificationResult && (
            <Card variant="outlined" sx={{ mt: 3, bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Classification Result
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Waste Type
                      </Typography>
                      <Chip
                        label={classificationResult.waste_type?.toUpperCase()}
                        sx={{ 
                          bgcolor: getWasteTypeColor(classificationResult.waste_type),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Biodegradability
                      </Typography>
                      <Chip
                        label={classificationResult.biodegradability?.toUpperCase()}
                        icon={classificationResult.biodegradability === 'biodegradable' ? <CheckCircle /> : <Cancel />}
                        sx={{ 
                          bgcolor: getBiodegradabilityColor(classificationResult.biodegradability),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Confidence Level
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {classificationResult.confidence}%
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {classificationResult.recycling_instructions && (
                    <Grid item xs={12}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Recycling Instructions
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'info.main' }}>
                          {classificationResult.recycling_instructions}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  
                  {classificationResult.environmental_impact && (
                    <Grid item xs={12}>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Environmental Impact
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'warning.main' }}>
                          {classificationResult.environmental_impact}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 2 }} />
                
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setOpen(true)}
                  sx={{ mr: 1 }}
                >
                  View Details
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={resetClassifier}
                >
                  Classify Another
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Detailed Results Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detailed Classification Results</DialogTitle>
        <DialogContent>
          {classificationResult && (
            <Box>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '16px', 
                borderRadius: '8px',
                fontSize: '14px',
                overflow: 'auto'
              }}>
                {JSON.stringify(classificationResult, null, 2)}
              </pre>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WasteClassifier; 