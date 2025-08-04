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
  IconButton,
  CircularProgress,
  TextField,
  Autocomplete
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
  EditLocation,
  Search
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
// Correct way to import Leaflet Routing Machine:
// Import the side effect to register L.Routing.control
import 'leaflet-routing-machine';
import LocationAutocomplete from './LocationAutocomplete'; 

// Fix for default markers - Essential for Leaflet to display markers correctly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for different types of markers on the map
const collectorIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // A truck icon for the collector
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const userRequestIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3412/3412414.png', // A general pin icon for user requests
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25]
});

const urgentRequestIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2797/2797387.png', // An urgent/warning icon for high-priority requests
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25]
});

const CollectorMap = ({ claimedMaterial }) => {
  // State variables to manage map behavior, locations, and UI elements
  const [collectorLocation, setCollectorLocation] = useState(null); // Current location of the collector
  const [loading, setLoading] = useState(false); // Loading state for GPS location
  const [error, setError] = useState(''); // Error messages for location/routing
  const [selectedRequest, setSelectedRequest] = useState(null); // The request currently being viewed in detail
  const [detailsDialog, setDetailsDialog] = useState(false); // Visibility of the request details dialog
  const [routeMode, setRouteMode] = useState(false); // Toggles between displaying all requests and route planning mode
  const [fromLocation, setFromLocation] = useState(''); // Input for the starting location of the route
  const [routeData, setRouteData] = useState(null); // Stores calculated route details (distance, duration, coordinates)
  const [routeLoading, setRouteLoading] = useState(false); // Loading state for route calculation
  const [fromCoordinates, setFromCoordinates] = useState(null); // Coordinates for the starting location
  const [destinationCoordinates, setDestinationCoordinates] = useState(null); // Coordinates for the destination location
  const [routeControl, setRouteControl] = useState(null); // Reference to the Leaflet Routing Machine control
  const [locationSuggestions, setLocationSuggestions] = useState([]); // Suggestions for the 'from' location Autocomplete
  const [suggestionsLoading, setSuggestionsLoading] = useState(false); // Loading state for location suggestions
  
  const mapRef = useRef(); // Ref to access the Leaflet map instance directly
  const searchTimeoutRef = useRef(); // Ref for debouncing location search input

  // Mock user waste requests data - This data would typically come from an API
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

  // Get collector's current location using browser's Geolocation API
  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCollectorLocation([latitude, longitude]);
        setFromCoordinates([latitude, longitude]); // Set 'from' coordinates to current GPS location
        setFromLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`); // Display coordinates in the input
        setLoading(false);
      },
      (error) => {
        setError('Location access denied. Please enable location services or enter address manually.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 } // Options for geolocation
    );
  };

  // Helper function to convert degrees to radians for Haversine formula
  const toRad = (value) => {
    return value * Math.PI / 180;
  };

  // Calculate distance between two points using the Haversine formula
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

  // Handles navigation to a user's location using Google Maps
  const handleNavigate = (request) => {
    const [lat, lng] = request.location;
    // Corrected Google Maps URL format: saddr for start, daddr for destination
    // For direct navigation, you might not have a precise 'saddr' from the map,
    // so simply providing 'daddr' will prompt Google Maps to use current location.
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  };

  // Handles showing detailed information for a selected request
  const handleRequestDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialog(true);
  };

  // Handles claiming a request (mock functionality)
  const handleClaimRequest = (request) => {
    alert(`Request "${request.title}" has been claimed! Contact ${request.userName} at ${request.contact}`);
    setDetailsDialog(false);
    // Optionally, you might want to switch to route mode automatically here
    setRouteMode(true);
    setDestinationCoordinates(request.location); // Set destination to claimed material location
  };

  // MapController component to handle map centering and setting the map ref
  const MapController = ({ center, zoom }) => {
    const map = useMap(); // Access the map instance

    useEffect(() => {
      if (center) {
        map.setView(center, zoom); // Center the map
      }
      mapRef.current = map; // Store the map instance in ref
    }, [center, zoom, map]); // Dependencies ensure this runs when center/zoom/map changes

    return null; // This component doesn't render anything directly
  };

  // Helper to get priority chip color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Helper to get waste type color (for Chips)
  const getWasteTypeColor = (wasteType) => {
    const colorMap = {
      'Plastic': '#2196F3', // Blue
      'Organic': '#4CAF50', // Green
      'E-waste': '#9C27B0', // Purple
      'Paper': '#FF9800', // Orange
      'Glass': '#00BCD4', // Cyan
      'Metal': '#607D8B' // Greyish-blue
    };
    return colorMap[wasteType] || '#757575'; // Default grey
  };

  // Helper to get waste type emoji icon
  const getWasteTypeIcon = (wasteType) => {
    const iconMap = {
      'Plastic': '🥤',
      'Organic': '🍃',
      'E-waste': '📱',
      'Paper': '📄',
      'Glass': '🍾',
      'Metal': '🔧'
    };
    return iconMap[wasteType] || '♻️'; // Default recycle emoji
  };

  // Determine map center based on route mode or collector location
  const mapCenter = routeMode && claimedMaterial && Array.isArray(claimedMaterial.location)
    ? claimedMaterial.location
    : (collectorLocation || [19.0760, 72.8777]); // Default to Mumbai if no location

  // Effect to switch to route mode if a claimed material is passed in props
  useEffect(() => {
    if (claimedMaterial) {
      setRouteMode(true);
      setSelectedRequest(claimedMaterial); // Set the selected request to the claimed material
      if (Array.isArray(claimedMaterial.location)) {
        setDestinationCoordinates(claimedMaterial.location); // Set destination if coordinates available
      } else if (typeof claimedMaterial.location === 'string') {
        // If location is an address string, geocode it to get coordinates for routing
        geocodeLocation(claimedMaterial.location, setDestinationCoordinates);
      }
    }
  }, [claimedMaterial]);

  // Function to fetch location suggestions using Nominatim (OpenStreetMap)
  const fetchLocationSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setLocationSuggestions([]); // Clear suggestions if query is too short
      return;
    }

    setSuggestionsLoading(true);

    try {
      // Nominatim API call for search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in&addressdetails=1`
      );
      const data = await response.json();

      const suggestions = data.map((item) => ({
        label: item.display_name,
        value: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        place_id: item.place_id
      }));

      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setLocationSuggestions([]);
      setError('Failed to fetch location suggestions. Please try again.');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Handle address input change with debouncing for performance
  const handleAddressInputChange = (event, newValue) => {
    setFromLocation(newValue); // Update the input field value

    // Clear previous timeout to prevent multiple calls
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debouncing the search request
    searchTimeoutRef.current = setTimeout(() => {
      fetchLocationSuggestions(newValue);
    }, 300); // 300ms debounce time
  };

  // Handle selection from the Autocomplete dropdown
  const handleLocationSelect = (event, newValue) => {
    if (newValue && typeof newValue === 'object') {
      setFromLocation(newValue.label); // Set the input to the selected label
      const location = [newValue.lat, newValue.lon];
      setFromCoordinates(location); // Store the coordinates
      setCollectorLocation(location); // Optionally update collector's location on map
      setLocationSuggestions([]); // Clear suggestions
    }
  };

  // Handle location selection from LocationAutocomplete component
  const handleLocationAutocompleteSelect = (location) => {
    setFromLocation(location.description);
    
    // Extract coordinates if available
    if (location.lat && location.lng) {
      const coords = [parseFloat(location.lat), parseFloat(location.lng)];
      setFromCoordinates(coords);
      setCollectorLocation(coords);
    } else if (location.lat && location.lon) {
      const coords = [parseFloat(location.lat), parseFloat(location.lon)];
      setFromCoordinates(coords);
      setCollectorLocation(coords);
    }
    // If Google Places API is used, we might need to fetch details for coordinates
    else if (location.id && window.google && window.google.maps) {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails({
        placeId: location.id,
        fields: ['geometry']
      }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
          const coords = [
            place.geometry.location.lat(),
            place.geometry.location.lng()
          ];
          setFromCoordinates(coords);
          setCollectorLocation(coords);
        }
      });
    }
  };

  // Geocode a location string to coordinates using Nominatim
  const geocodeLocation = async (address, setCoordsState) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=in`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setCoordsState(coords); // Update the specified coordinate state
        return coords;
      }
      throw new Error('Location not found for the given address.');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address: ' + error.message);
    }
  };

  // Calculate and display the route using Leaflet Routing Machine
  const calculateRoute = (fromCoords, toCoords) => {
    setRouteLoading(true);
    setError('');

    if (!mapRef.current) {
      setError('Map not ready. Please try again.');
      setRouteLoading(false);
      return;
    }

    // Remove any existing route control before adding a new one
    if (routeControl) {
      mapRef.current.removeControl(routeControl);
      setRouteControl(null); // Clear the reference
    }

    try {
      const waypoints = [
        L.latLng(fromCoords),
        L.latLng(toCoords)
      ];

      // Use L.Routing.control directly
      const newRouteControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false, // Prevents re-routing while dragging waypoints
        createMarker: function () { return null; }, // Don't create default markers for waypoints
        lineOptions: {
          styles: [{ color: '#2196F3', weight: 5, opacity: 0.7 }] // Styling for the route line
        },
        showAlternatives: false, // Don't show alternative routes
        fitSelectedRoutes: true // Zoom to fit the route on the map
      });

      // Event listener for when routes are found
      newRouteControl.on('routesfound', function(e) {
        const routes = e.routes;
        if (routes && routes.length > 0) {
          const route = routes[0];
          setRouteData({
            distance: route.summary.totalDistance,
            duration: route.summary.totalTime,
            coordinates: route.coordinates
          });
          
          // CORRECTED: Fit map to the bounds of the found route
          // The bounds are available on the route object itself.
          if (route.coordinates && route.coordinates.length > 0) {
            const bounds = L.latLngBounds(route.coordinates);
            mapRef.current.fitBounds(bounds, { padding: [50, 50] }); // Add padding for better view
          }
          
        } else {
          setError('No route found between the specified locations.');
        }
        setRouteLoading(false);
      });

      // Event listener for routing errors
      newRouteControl.on('routingerror', function(e) {
        setError('Failed to calculate route: ' + (e.error.message || 'Unknown error.'));
        setRouteLoading(false);
        // Ensure route control is removed on error as well
        if (routeControl && mapRef.current) {
          mapRef.current.removeControl(routeControl);
          setRouteControl(null);
        }
      });

      newRouteControl.addTo(mapRef.current); // Add the routing control to the map
      setRouteControl(newRouteControl); // Store the control instance
    } catch (error) {
      setError('Failed to initialize route calculation: ' + error.message);
      setRouteLoading(false);
    }
  };

  // Handle the "Get Route" button click
  const handlePlanRoute = async () => {
    if (!fromLocation.trim()) {
      setError('Please enter your starting location.');
      return;
    }
    if (!claimedMaterial) {
      setError('No destination selected for routing. Please select a request.');
      return;
    }

    setRouteLoading(true);
    setError('');

    try {
      let currentFromCoords = fromCoordinates;
      // If fromCoordinates are not set (e.g., manually typed address), geocode it
      if (!currentFromCoords) {
        currentFromCoords = await geocodeLocation(fromLocation, setFromCoordinates);
      }

      let currentToCoords = destinationCoordinates;
      // If destinationCoordinates are not set (e.g., from claimedMaterial with string address), geocode it
      if (!currentToCoords && typeof claimedMaterial.location === 'string') {
        currentToCoords = await geocodeLocation(claimedMaterial.location, setDestinationCoordinates);
      } else if (!currentToCoords && Array.isArray(claimedMaterial.location)) {
        currentToCoords = claimedMaterial.location;
      }

      if (currentFromCoords && currentToCoords) {
        calculateRoute(currentFromCoords, currentToCoords);
      } else {
        setError('Could not determine both start and end points for the route.');
        setRouteLoading(false);
      }
    } catch (error) {
      setError(error.message);
      setRouteLoading(false);
    }
  };

  // Format duration from seconds to hours and minutes
  const formatDuration = (seconds) => {
    const minutes = Math.round(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  // Format distance from meters to kilometers or meters
  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  // Lifecycle Hooks:

  // Auto-get location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []); // Empty dependency array means this runs once on mount

  // Cleanup route control on unmount or when routeMode changes to false
  useEffect(() => {
    return () => {
      if (routeControl && mapRef.current) {
        mapRef.current.removeControl(routeControl);
        setRouteControl(null); // Clear the reference
      }
    };
  }, [routeMode, routeControl]); // Re-run if routeMode or routeControl changes

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box>
      {/* Header Section */}
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
              {loading ? 'Locating...' : 'Use GPS Location'}
            </Button>
          </Box>

          <Grid container spacing={2}>
            {/* Priority Status Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'error.main', color: 'white' }}>
                <Typography variant="h4" color="inherit">
                  {userRequests.filter(r => r.priority === 'high').length}
                </Typography>
                <Typography variant="caption" color="inherit">
                  High Priority
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.main', color: 'white' }}>
                <Typography variant="h4" color="inherit">
                  {userRequests.filter(r => r.priority === 'medium').length}
                </Typography>
                <Typography variant="caption" color="inherit">
                  Medium Priority
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
                <Typography variant="h4" color="inherit">
                  {userRequests.filter(r => r.priority === 'low').length}
                </Typography>
                <Typography variant="caption" color="inherit">
                  Low Priority
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.main', color: 'white' }}>
                <Typography variant="h4" color="inherit">
                  {userRequests.length}
                </Typography>
                <Typography variant="caption" color="inherit">
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

          {collectorLocation && !routeMode && (
            <Paper elevation={1} sx={{ mt: 2, p: 2, bgcolor: 'info.light' }}>
              <Typography variant="body2" color="info.contrastText">
                📍 Your Current Location: {collectorLocation[0].toFixed(4)}, {collectorLocation[1].toFixed(4)}
              </Typography>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Route Planning Interface */}
      {routeMode && claimedMaterial && (
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
              <Route sx={{ mr: 1 }} />
              Route to: {claimedMaterial.title || 'Selected Request'}
            </Typography>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} md={5}>
                <LocationAutocomplete
                  value={fromLocation}
                  onChange={setFromLocation}
                  onSelect={handleLocationAutocompleteSelect}
                  label="From Location (Your Starting Point)"
                  placeholder="Enter your starting address or coordinates"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={getCurrentLocation}
                  disabled={loading || routeLoading}
                  startIcon={loading ? <CircularProgress size={20} /> : <MyLocation />}
                  sx={{ height: '56px' }}
                >
                  {loading ? 'GPS...' : 'Use GPS'}
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePlanRoute}
                  disabled={routeLoading || !fromLocation.trim()}
                  startIcon={routeLoading ? <CircularProgress size={20} /> : <Directions />}
                  sx={{ height: '56px' }}
                >
                  {routeLoading ? 'Calculating...' : 'Get Route'}
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setRouteMode(false);
                    setRouteData(null); // Clear route data when exiting route mode
                    setError(''); // Clear any route-related errors
                    setSelectedRequest(null); // Clear selected request
                    if (routeControl && mapRef.current) { // Ensure cleanup
                      mapRef.current.removeControl(routeControl);
                      setRouteControl(null);
                    }
                  }}
                  sx={{ height: '56px' }}
                >
                  Back to Map
                </Button>
              </Grid>
            </Grid>

            {/* Destination Info */}
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1 }} /> Destination: {claimedMaterial.address || (Array.isArray(claimedMaterial.location) ? `${claimedMaterial.location[0].toFixed(4)}, ${claimedMaterial.location[1].toFixed(4)}` : claimedMaterial.location)}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Contact:</strong> {claimedMaterial.userName || claimedMaterial.postedBy} ({claimedMaterial.contact})
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Material:</strong> {claimedMaterial.wasteType || claimedMaterial.type} ({claimedMaterial.weight})
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Route Information Display */}
            {routeData && (
              <Paper elevation={2} sx={{ mt: 2, p: 3, bgcolor: 'success.light', color: 'text.primary' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Navigation sx={{ mr: 1 }} />
                  Route Information
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {formatDistance(routeData.distance)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Distance</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.dark' }}>
                        {formatDuration(routeData.duration)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Estimated Duration</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          const origin = fromCoordinates ? `${fromCoordinates[0]},${fromCoordinates[1]}` : encodeURIComponent(fromLocation);
                          const destination = destinationCoordinates ? `${destinationCoordinates[0]},${destinationCoordinates[1]}` : encodeURIComponent(claimedMaterial.address || claimedMaterial.location);
                          // Corrected Google Maps URL for directions
                          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
                          window.open(googleMapsUrl, '_blank');
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

      {/* Main Map Display Area */}
      <Card elevation={3}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: '600px', position: 'relative' }}>
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              whenCreated={mapInstance => { mapRef.current = mapInstance; }} // Alternative way to set map ref
            >
              <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

              {/* User request markers - visible only when not in route mode */}
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
                          Navigate (GMaps)
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={() => {
                            setSelectedRequest(request); // Set the selected request
                            setDestinationCoordinates(request.location); // Set destination
                            setRouteMode(true); // Enter route mode
                          }}
                          startIcon={<Route />}
                        >
                          Plan Route
                        </Button>
                      </div>
                      {collectorLocation && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                          📍 Distance: {calculateDistance(collectorLocation, request.location).toFixed(2)} km
                        </Typography>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Display the claimed material marker only when in route mode */}
              {routeMode && claimedMaterial && (
                <Marker position={destinationCoordinates || claimedMaterial.location} icon={urgentRequestIcon}>
                  <Popup>
                    <div>
                      <strong>Destination: {claimedMaterial.title}</strong>
                      <br />
                      {claimedMaterial.address || claimedMaterial.location}
                      <br />
                      <small>User: {claimedMaterial.userName}</small>
                    </div>
                  </Popup>
                </Marker>
              )}

            </MapContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="span" sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn sx={{ mr: 1, color: 'primary.main' }} /> Request Details
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setDetailsDialog(false)}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Stack spacing={2}>
              <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getWasteTypeIcon(selectedRequest.wasteType)} {selectedRequest.title}
              </Typography>
              <Chip
                label={selectedRequest.priority.toUpperCase()}
                color={getPriorityColor(selectedRequest.priority)}
                size="medium"
                sx={{ width: 'fit-content' }}
              />
              <Divider />
              <Typography variant="body1">
                <strong>Description:</strong> {selectedRequest.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label={selectedRequest.wasteType}
                      size="small"
                      sx={{ bgcolor: getWasteTypeColor(selectedRequest.wasteType), color: 'white' }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Schedule sx={{ mr: 0.5, fontSize: 18 }} /> <strong>Posted:</strong> {selectedRequest.postedAt}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Weight:</strong> {selectedRequest.weight}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Value:</strong> {selectedRequest.estimatedValue}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 0.5, fontSize: 18 }} /> <strong>Address:</strong> {selectedRequest.address}
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 0.5, fontSize: 18 }} /> Contact Person: {selectedRequest.userName}
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 0.5, fontSize: 18 }} /> {selectedRequest.contact}
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime sx={{ mr: 0.5, fontSize: 18 }} /> Notes: {selectedRequest.notes}
              </Typography>
              {selectedRequest.aiClassification && (
                <>
                  <Divider />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>AI Classification:</Typography>
                  <Typography variant="body2">
                    <strong>Biodegradable:</strong> {selectedRequest.aiClassification.biodegradable ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Confidence:</strong> {selectedRequest.aiClassification.confidence}%
                  </Typography>
                  <Typography variant="body2">
                    <strong>Recycling Instructions:</strong> {selectedRequest.aiClassification.recycling_instructions}
                  </Typography>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)} startIcon={<Close />}>
            Close
          </Button>
          <Button
            onClick={() => handleClaimRequest(selectedRequest)}
            variant="contained"
            color="primary"
            startIcon={<LocalShipping />}
          >
            Claim Request
          </Button>
          <Button
            onClick={() => {
              if (selectedRequest) {
                setDestinationCoordinates(selectedRequest.location); // Set destination
                setRouteMode(true); // Switch to route mode
                setDetailsDialog(false); // Close dialog
              }
            }}
            variant="contained"
            color="secondary"
            startIcon={<Directions />}
          >
            Plan Route to Here
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectorMap;