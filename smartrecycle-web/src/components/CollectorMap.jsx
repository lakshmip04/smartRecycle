import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Paper,
  Stack,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Polyline,
  IconButton,
  CircularProgress,
  TextField
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  Directions,
  Person,
  Schedule,
  LocalShipping,
  Phone,
  Close,
  Navigation,
  Route,
  AccessTime,
  EditLocation
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import LRM from 'leaflet-routing-machine';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons
const collectorIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const userRequestIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3412/3412414.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25]
});

const urgentRequestIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2797/2797387.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25]
});

const CollectorMap = ({ claimedMaterial }) => {
  const [collectorLocation, setCollectorLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [routeMode, setRouteMode] = useState(false);
  const [fromLocation, setFromLocation] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [fromCoordinates, setFromCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [routeControl, setRouteControl] = useState(null);
  const mapRef = useRef();

  // Mock user waste requests data
  const userRequests = [
    {
      id: 1,
      title: 'Plastic Bottles Collection',
      description: '50+ PET bottles from office pantry, clean and sorted',
      wasteType: 'Plastic',
      weight: '5.2 kg',
      location: [12.9716, 77.5946], // Bengaluru (City Center)
      address: 'MG Road, Bengaluru - 560001',
      userName: 'Rajesh Kumar',
      contact: '+91 98765 43210',
      email: 'rajesh.kumar@email.com',
      postedAt: '2 hours ago',
      status: 'Available',
      priority: 'medium',
      estimatedValue: '₹156',
      notes: 'Available for pickup between 9 AM - 6 PM',
      aiClassification: {
        biodegradable: false,
        confidence: 95,
        recycling_instructions: 'Remove caps, rinse thoroughly, sort by color'
      }
    },
    {
      id: 2,
      title: 'Organic Kitchen Waste',
      description: 'Daily kitchen waste - vegetable peels, food scraps',
      wasteType: 'Organic',
      weight: '3.8 kg',
      location: [12.9352, 77.6245], // Bengaluru (Koramangala)
      address: 'Koramangala, Bengaluru - 560034',
      userName: 'Priya Sharma',
      contact: '+91 87654 32109',
      email: 'priya.sharma@email.com',
      postedAt: '1 hour ago',
      status: 'Available',
      priority: 'high',
      estimatedValue: '₹76',
      notes: 'Need immediate pickup due to smell',
      aiClassification: {
        biodegradable: true,
        confidence: 98,
        recycling_instructions: 'Compost within 24 hours, separate wet and dry waste'
      }
    },
    {
      id: 3,
      title: 'Electronic Waste',
      description: 'Old phones, chargers, and small electronic devices',
      wasteType: 'E-waste',
      weight: '2.1 kg',
      location: [12.9827, 77.5900], // Bengaluru (Shivajinagar)
      address: 'Shivajinagar, Bengaluru - 560051',
      userName: 'Tech Solutions Ltd',
      contact: '+91 76543 21098',
      email: 'disposal@techsolutions.com',
      postedAt: '4 hours ago',
      status: 'Available',
      priority: 'medium',
      estimatedValue: '₹420',
      notes: 'Corporate pickup, security clearance required',
      aiClassification: {
        biodegradable: false,
        confidence: 99,
        recycling_instructions: 'Properly dispose at certified e-waste facility'
      }
    },
    {
      id: 4,
      title: 'Mixed Paper & Cardboard',
      description: 'Amazon boxes, newspapers, office paper',
      wasteType: 'Paper',
      weight: '8.5 kg',
      location: [12.9088, 77.6477], // Bengaluru (HSR Layout)
      address: 'HSR Layout, Bengaluru - 560102',
      userName: 'Café Mocha',
      contact: '+91 65432 10987',
      email: 'manager@cafemocha.com',
      postedAt: '6 hours ago',
      status: 'Available',
      priority: 'low',
      estimatedValue: '₹255',
      notes: 'Pickup after 5 PM preferred',
      aiClassification: {
        biodegradable: true,
        confidence: 92,
        recycling_instructions: 'Remove plastic tape, rinse thoroughly, separate by paper type'
      }
    },
    {
      id: 5,
      title: 'Glass Bottles & Jars',
      description: 'Wine bottles, jam jars, glass containers',
      wasteType: 'Glass',
      weight: '6.3 kg',
      location: [13.0298, 77.5707], // Bengaluru (Malleshwaram)
      address: 'Malleshwaram, Bengaluru - 560003',
      userName: 'Anil Patel',
      contact: '+91 54321 09876',
      email: 'anil.patel@email.com',
      postedAt: '8 hours ago',
      status: 'Available',
      priority: 'medium',
      estimatedValue: '₹189',
      notes: 'Handle with care, some items are fragile',
      aiClassification: {
        biodegradable: false,
        confidence: 97,
        recycling_instructions: 'Sort by color, remove labels and caps'
      }
    },
    {
      id: 6,
      title: 'Metal Scrap Collection',
      description: 'Aluminum cans, steel containers, wire scraps',
      wasteType: 'Metal',
      weight: '4.7 kg',
      location: [13.0070, 77.5683], // Bengaluru (Rajajinagar)
      address: 'Rajajinagar, Bengaluru - 560010',
      userName: 'Bengaluru Metals Ltd',
      contact: '+91 43210 98765',
      email: 'scrap@bengalurumetal.com',
      postedAt: '12 hours ago',
      status: 'Available',
      priority: 'low',
      estimatedValue: '₹235',
      notes: 'Industrial waste, safety equipment recommended',
      aiClassification: {
        biodegradable: false,
        confidence: 96,
        recycling_instructions: 'Sort by metal type, remove non-metal attachments'
      }
    }
  ];

  // Get collector's current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCollectorLocation([latitude, longitude]);
        setLoading(false);
      },
      (error) => {
        setError('Location access denied. Please enable location services.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (pos1, pos2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(pos2[0] - pos1[0]);
    const dLon = toRad(pos2[1] - pos1[1]);
    const lat1 = toRad(pos1[0]);
    const lat2 = toRad(pos2[0]);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  };

  const toRad = (value) => {
    return value * Math.PI / 180;
  };

  // Handle navigation to user location
  const handleNavigate = (request) => {
    const [lat, lng] = request.location;
    // Open in Google Maps
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  };

  // Handle request details
  const handleRequestDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialog(true);
  };

  // Handle claim request
  const handleClaimRequest = (request) => {
    alert(`Request "${request.title}" has been claimed! Contact ${request.userName} at ${request.contact}`);
    setDetailsDialog(false);
  };

  // Component to handle map centering and ref
  const MapController = ({ center, zoom }) => {
    const map = useMap();
    
    useEffect(() => {
      if (center) {
        map.setView(center, zoom);
      }
      // Store map reference for routing
      mapRef.current = map;
    }, [center, zoom, map]);
    
    return null;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Get waste type color
  const getWasteTypeColor = (wasteType) => {
    const colorMap = {
      'Plastic': '#2196F3',
      'Organic': '#4CAF50',
      'E-waste': '#9C27B0',
      'Paper': '#FF9800',
      'Glass': '#00BCD4',
      'Metal': '#607D8B'
    };
    return colorMap[wasteType] || '#757575';
  };

  // Get waste type icon
  const getWasteTypeIcon = (wasteType) => {
    const iconMap = {
      'Plastic': '🥤',
      'Organic': '🍃',
      'E-waste': '📱',
      'Paper': '📄',
      'Glass': '🍾',
      'Metal': '🔧'
    };
    return iconMap[wasteType] || '♻️';
  };

  const mapCenter = routeMode && claimedMaterial && Array.isArray(claimedMaterial.location) ? claimedMaterial.location : (collectorLocation || [19.0760, 72.8777]);

  // Check if we have a claimed material and set route mode
  useEffect(() => {
    if (claimedMaterial) {
      setRouteMode(true);
      setSelectedRequest(claimedMaterial);
      
      // Set destination coordinates if available
      if (Array.isArray(claimedMaterial.location)) {
        setDestinationCoordinates(claimedMaterial.location);
      }
    }
  }, [claimedMaterial]);

  // Auto-get location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Cleanup route control on unmount or route mode change
  useEffect(() => {
    return () => {
      if (routeControl && mapRef.current) {
        mapRef.current.removeControl(routeControl);
      }
    };
  }, [routeControl]);

  // Clear route when exiting route mode
  useEffect(() => {
    if (!routeMode && routeControl && mapRef.current) {
      mapRef.current.removeControl(routeControl);
      setRouteControl(null);
      setRouteData(null);
    }
  }, [routeMode, routeControl]);

  // Geocode from location
  const geocodeFromLocation = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=in`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setFromCoordinates(coords);
        return coords;
      }
      throw new Error('Location not found');
    } catch (error) {
      throw new Error('Failed to geocode address');
    }
  };

  // Calculate route using Leaflet Routing Machine
  const calculateRoute = (fromCoords, toCoords) => {
    setRouteLoading(true);
    
    if (!mapRef.current) {
      setError('Map not ready');
      setRouteLoading(false);
      return;
    }

    // Remove existing route control
    if (routeControl) {
      mapRef.current.removeControl(routeControl);
    }

    try {
      const newRouteControl = LRM.control({
        waypoints: [
          L.latLng(fromCoords),
          L.latLng(toCoords)
        ],
        routeWhileDragging: false,
        createMarker: function () { return null; }, // Don't create default markers
        lineOptions: {
          styles: [{ color: '#2196F3', weight: 5, opacity: 0.7 }]
        }
      });

      newRouteControl.on('routesfound', function(e) {
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const route = routes[0];
          setRouteData({
            distance: route.summary.totalDistance,
            duration: route.summary.totalTime,
            coordinates: route.coordinates
          });
        }
        setRouteLoading(false);
      });

      newRouteControl.on('routingerror', function(e) {
        setError('Failed to calculate route: ' + e.error.message);
        setRouteLoading(false);
      });

      newRouteControl.addTo(mapRef.current);
      setRouteControl(newRouteControl);
      
    } catch (error) {
      setError('Failed to initialize route calculation');
      setRouteLoading(false);
    }
  };

  // Handle route planning
  const handlePlanRoute = async () => {
    if (!fromLocation.trim()) {
      setError('Please enter a starting location');
      return;
    }

    try {
      setError('');
      const fromCoords = await geocodeFromLocation(fromLocation);
      
      // Get destination coordinates - either from location array or geocode the address
      let toCoords;
      if (Array.isArray(claimedMaterial.location)) {
        toCoords = claimedMaterial.location;
      } else {
        // Geocode the location string
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(claimedMaterial.location)}&limit=1&countrycodes=in`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          toCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          setDestinationCoordinates(toCoords);
        } else {
          throw new Error('Could not find destination location');
        }
      }
      
      calculateRoute(fromCoords, toCoords);
    } catch (error) {
      setError(error.message);
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    const minutes = Math.round(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  // Format distance
  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  return (
    <Box>
      {/* Header */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
              Collection Requests Map
            </Typography>
            <Button
              variant="outlined"
              onClick={getCurrentLocation}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <MyLocation />}
              size="small"
            >
              {loading ? 'Locating...' : 'My Location'}
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                <Typography variant="h4" color="error.contrastText">
                  {userRequests.filter(r => r.priority === 'high').length}
                </Typography>
                <Typography variant="caption" color="error.contrastText">
                  High Priority
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                <Typography variant="h4" color="warning.contrastText">
                  {userRequests.filter(r => r.priority === 'medium').length}
                </Typography>
                <Typography variant="caption" color="warning.contrastText">
                  Medium Priority
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                <Typography variant="h4" color="success.contrastText">
                  {userRequests.filter(r => r.priority === 'low').length}
                </Typography>
                <Typography variant="caption" color="success.contrastText">
                  Low Priority
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                <Typography variant="h4" color="info.contrastText">
                  {userRequests.length}
                </Typography>
                <Typography variant="caption" color="info.contrastText">
                  Total Requests
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Route Planning Interface */}
      {routeMode && claimedMaterial && (
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
              <Route sx={{ mr: 1 }} />
              Route to: {claimedMaterial.title || claimedMaterial.type}
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Location (Your Starting Point)"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  placeholder="Enter your starting address"
                  InputProps={{
                    startAdornment: <EditLocation sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePlanRoute}
                  disabled={routeLoading}
                  startIcon={routeLoading ? <CircularProgress size={20} /> : <Directions />}
                  sx={{ height: '56px' }}
                >
                  {routeLoading ? 'Calculating...' : 'Get Route'}
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setRouteMode(false)}
                  sx={{ height: '56px' }}
                >
                  Back to Map
                </Button>
              </Grid>
            </Grid>

            {/* Destination Info */}
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'info.light' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                📍 Destination: {claimedMaterial.address || claimedMaterial.location}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Contact:</strong> {claimedMaterial.userName || claimedMaterial.postedBy} ({claimedMaterial.contact})
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Material:</strong> {claimedMaterial.wasteType || claimedMaterial.type} ({claimedMaterial.weight} kg)
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Route Information */}
            {routeData && (
              <Paper elevation={2} sx={{ mt: 2, p: 3, bgcolor: 'success.light' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Navigation sx={{ mr: 1 }} />
                  Route Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {formatDistance(routeData.distance)}
                      </Typography>
                      <Typography variant="caption">Distance</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                        {formatDuration(routeData.duration)}
                      </Typography>
                      <Typography variant="caption">Duration</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          if (Array.isArray(claimedMaterial.location)) {
                            const [lat, lng] = claimedMaterial.location;
                            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                            window.open(googleMapsUrl, '_blank');
                          } else {
                            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(claimedMaterial.location)}&travelmode=driving`;
                            window.open(googleMapsUrl, '_blank');
                          }
                        }}
                        startIcon={<Navigation />}
                        sx={{ mt: 1 }}
                      >
                        Open in Google Maps
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <Card elevation={3}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: '600px', position: 'relative' }}>
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapController center={mapCenter} zoom={collectorLocation ? 13 : 12} />
              
              {/* Collector marker */}
              {collectorLocation && (
                <Marker position={collectorLocation} icon={collectorIcon}>
                  <Popup>
                    <div>
                      <strong>🚛 Your Location</strong>
                      <br />
                      Collector Position
                      <br />
                      <small>Lat: {collectorLocation[0].toFixed(4)}, Lng: {collectorLocation[1].toFixed(4)}</small>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* User request markers */}
              {!routeMode && userRequests.map((request) => (
                <Marker 
                  key={request.id} 
                  position={request.location} 
                  icon={request.priority === 'high' ? urgentRequestIcon : userRequestIcon}
                >
                  <Popup>
                    <div style={{ minWidth: '250px' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {getWasteTypeIcon(request.wasteType)} {request.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Type:</strong> {request.wasteType} ({request.weight})
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Value:</strong> {request.estimatedValue}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>User:</strong> {request.userName}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Posted:</strong> {request.postedAt}
                      </Typography>
                      <Chip 
                        label={request.priority.toUpperCase()} 
                        color={getPriorityColor(request.priority)}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handleRequestDetails(request)}
                        >
                          Details
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleNavigate(request)}
                          startIcon={<Navigation />}
                        >
                          Navigate
                        </Button>
                      </div>
                      {collectorLocation && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                          📍 {calculateDistance(collectorLocation, request.location).toFixed(2)} km away
                        </Typography>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Route Mode - Show only claimed material marker */}
              {routeMode && claimedMaterial && destinationCoordinates && (
                <Marker 
                  position={destinationCoordinates} 
                  icon={urgentRequestIcon}
                >
                  <Popup>
                    <div style={{ minWidth: '250px' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        🎯 CLAIMED: {claimedMaterial.title || claimedMaterial.type}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Type:</strong> {claimedMaterial.wasteType || claimedMaterial.type} ({claimedMaterial.weight} kg)
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>User:</strong> {claimedMaterial.userName || claimedMaterial.postedBy}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Contact:</strong> {claimedMaterial.contact}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Address:</strong> {claimedMaterial.address || claimedMaterial.location}
                      </Typography>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* From location marker */}
              {fromCoordinates && (
                <Marker position={fromCoordinates} icon={collectorIcon}>
                  <Popup>
                    <div>
                      <strong>🚛 Starting Point</strong>
                      <br />
                      {fromLocation}
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Route is handled by leaflet-routing-machine control */}
            </MapContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedRequest && getWasteTypeIcon(selectedRequest.wasteType)} Request Details
          </Typography>
          <IconButton onClick={() => setDetailsDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  {selectedRequest.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedRequest.description}
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={selectedRequest.wasteType}
                      sx={{ 
                        bgcolor: getWasteTypeColor(selectedRequest.wasteType),
                        color: 'white'
                      }}
                    />
                    <Chip 
                      label={`${selectedRequest.priority.toUpperCase()} Priority`}
                      color={getPriorityColor(selectedRequest.priority)}
                    />
                    <Chip 
                      label={selectedRequest.aiClassification.biodegradable ? 'Biodegradable' : 'Non-biodegradable'}
                      color={selectedRequest.aiClassification.biodegradable ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Weight & Value
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.weight} • {selectedRequest.estimatedValue}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Recycling Instructions
                    </Typography>
                    <Typography variant="body2">
                      {selectedRequest.aiClassification.recycling_instructions}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Special Notes
                    </Typography>
                    <Typography variant="body2">
                      {selectedRequest.notes}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1 }} />
                    Contact Information
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedRequest.userName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {selectedRequest.contact}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedRequest.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Address:</strong> {selectedRequest.address}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Posted:</strong> {selectedRequest.postedAt}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleClaimRequest(selectedRequest)}
                      startIcon={<LocalShipping />}
                    >
                      Claim Request
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleNavigate(selectedRequest)}
                      startIcon={<Directions />}
                    >
                      Get Directions
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      href={`tel:${selectedRequest.contact}`}
                      startIcon={<Phone />}
                    >
                      Call User
                    </Button>
                  </Stack>

                  {collectorLocation && (
                    <Paper elevation={0} sx={{ mt: 2, p: 1, bgcolor: 'info.light' }}>
                      <Typography variant="body2" color="info.contrastText">
                        📍 Distance: {calculateDistance(collectorLocation, selectedRequest.location).toFixed(2)} km
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CollectorMap; 