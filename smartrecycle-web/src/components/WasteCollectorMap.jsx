import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Alert,
  Paper,
  Stack,
  Chip,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  Search,
  DirectionsWalk
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

const collectorIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25]
});

const WasteCollectorMap = () => {
  const [selectedWasteType, setSelectedWasteType] = useState('electronic');
  const [userLocation, setUserLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nearestCollector, setNearestCollector] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const mapRef = useRef();
  const searchTimeoutRef = useRef();
  const collectors = [
    { id: 1, name: "EcoTech Collectors", location: [12.9716, 77.5946], types: ["electronic", "plastic"], contact: "+91 98765 43210", rating: 4.5 }, // Bengaluru
    { id: 2, name: "Green Waste Solutions", location: [12.2958, 76.6394], types: ["metal", "glass", "plastic"], contact: "+91 98765 43211", rating: 4.3 }, // Mysuru
    { id: 3, name: "Paper & Textile Co.", location: [13.0827, 80.2707], types: ["paper", "textile"], contact: "+91 98765 43212", rating: 4.7 }, // Chennai
    { id: 4, name: "Medical Waste Experts", location: [12.9141, 74.8560], types: ["medical", "hazardous"], contact: "+91 98765 43213", rating: 4.8 }, // Mangaluru
    { id: 5, name: "Organic Recyclers", location: [15.3173, 75.7139], types: ["organic", "mass collect"], contact: "+91 98765 43214", rating: 4.2 }, // Hubballi
    { id: 6, name: "MultiWaste Handlers", location: [11.0168, 76.9558], types: ["electronic", "glass", "textile"], contact: "+91 98765 43215", rating: 4.6 }, // Coimbatore
    { id: 7, name: "Universal Collectors", location: [12.8380, 77.6047], types: ["plastic", "metal", "mass collect"], contact: "+91 98765 43216", rating: 4.4 }, // Bengaluru South
    { id: 8, name: "Specialized Waste Co.", location: [12.9260, 77.6762], types: ["electronic", "hazardous", "textile"], contact: "+91 98765 43217", rating: 4.1 }, // Bengaluru East
  
    { id: 9, name: "City Scrap & Recycle", location: [19.0760, 72.8777], types: ["metal", "electronic"], contact: "+91 98765 43218", rating: 4.0 }, // Mumbai
    { id: 10, name: "Pune Eco Recycling", location: [18.5204, 73.8567], types: ["paper", "plastic", "organic"], contact: "+91 98765 43219", rating: 4.5 }, // Pune
    { id: 11, name: "Hyderabad Green Circle", location: [17.3850, 78.4867], types: ["glass", "plastic", "metal"], contact: "+91 98765 43220", rating: 4.2 }, // Hyderabad
    { id: 12, name: "Kolkata Waste Busters", location: [22.5726, 88.3639], types: ["textile", "paper", "electronic"], contact: "+91 98765 43221", rating: 4.6 }, // Kolkata
    { id: 13, name: "Delhiecycle Solutions", location: [28.7041, 77.1025], types: ["electronic", "plastic", "battery"], contact: "+91 98765 43222", rating: 4.9 }, // Delhi
    { id: 14, name: "Ahmedabad Green Collect", location: [23.0225, 72.5714], types: ["organic", "glass", "paper"], contact: "+91 98765 43223", rating: 3.9 }, // Ahmedabad
    { id: 15, name: "Jaipur Recyclers", location: [26.9124, 75.7873], types: ["metal", "plastic", "rubber"], contact: "+91 98765 43224", rating: 4.1 }, // Jaipur
    { id: 16, name: "Chandigarh Clean Sweep", location: [30.7333, 76.7794], types: ["electronic", "paper"], contact: "+91 98765 43225", rating: 4.7 }, // Chandigarh
    { id: 17, name: "Bhubaneswar Eco Hub", location: [20.2961, 85.8245], types: ["plastic", "organic"], contact: "+91 98765 43226", rating: 4.3 }, // Bhubaneswar
    { id: 18, name: "Lucknow Smart Recycle", location: [26.8467, 80.9462], types: ["textile", "glass", "battery"], contact: "+91 98765 43227", rating: 4.0 }, // Lucknow
    { id: 19, name: "Indore Waste Management", location: [22.7196, 75.8577], types: ["hazardous", "medical"], contact: "+91 98765 43228", rating: 4.8 }, // Indore
    { id: 20, name: "Patna Environment", location: [25.5941, 85.1376], types: ["paper", "plastic", "organic"], contact: "+91 98765 43229", rating: 3.8 }, // Patna
    { id: 21, name: "Goa Green Collect", location: [15.2993, 74.1240], types: ["glass", "plastic", "metal"], contact: "+91 98765 43230", rating: 4.5 }, // Goa
    { id: 22, name: "Nagpur Eco Warriors", location: [21.1458, 79.0882], types: ["electronic", "metal", "rubber"], contact: "+91 98765 43231", rating: 4.4 }, // Nagpur
    { id: 23, name: "Surat Recycling Point", location: [21.1702, 72.8311], types: ["textile", "plastic", "mass collect"], contact: "+91 98765 43232", rating: 4.2 }, // Surat
    { id: 24, name: "Vadodara Clean City", location: [22.3072, 73.1812], types: ["paper", "glass", "organic"], contact: "+91 98765 43233", rating: 4.0 }, // Vadodara
    { id: 25, name: "Thane Eco Partners", location: [19.2183, 72.9781], types: ["electronic", "plastic", "battery"], contact: "+91 98765 43234", rating: 4.6 }, // Thane
    { id: 26, name: "Nashik Zero Waste", location: [19.9975, 73.7898], types: ["organic", "glass"], contact: "+91 98765 43235", rating: 4.1 }, // Nashik
    { id: 27, name: "Mysore Recycling Hub", location: [12.2958, 76.6394], types: ["paper", "textile"], contact: "+91 98765 43236", rating: 4.7 }, // Mysuru
    { id: 28, name: "Kochi Green Initiatives", location: [9.9312, 76.2673], types: ["plastic", "electronic"], contact: "+91 98765 43237", rating: 4.5 }, // Kochi
    { id: 29, name: "Vizag Waste Solutions", location: [17.6868, 83.2185], types: ["metal", "glass", "mass collect"], contact: "+91 98765 43238", rating: 4.3 }, // Visakhapatnam
    { id: 30, name: "Agra Recycling Services", location: [27.1767, 78.0078], types: ["paper", "textile", "plastic"], contact: "+91 98765 43239", rating: 3.9 }, // Agra
    { id: 31, name: "Kanpur Eco Collect", location: [26.4499, 80.3319], types: ["electronic", "metal"], contact: "+91 98765 43240", rating: 4.0 }, // Kanpur
    { id: 32, name: "Varanasi Green City", location: [25.3176, 82.9739], types: ["organic", "glass"], contact: "+91 98765 43241", rating: 4.2 }, // Varanasi
    { id: 33, name: "Allahabad Clean Up", location: [25.4358, 81.8463], types: ["paper", "plastic"], contact: "+91 98765 43242", rating: 4.1 }, // Prayagraj (Allahabad)
    { id: 34, name: "Ranchi Eco Friendly", location: [23.3441, 85.3096], types: ["electronic", "battery"], contact: "+91 98765 43243", rating: 4.5 }, // Ranchi
    { id: 35, name: "Jamshedpur Recycling", location: [22.8045, 86.2029], types: ["metal", "rubber"], contact: "+91 98765 43244", rating: 4.6 }, // Jamshedpur
    { id: 36, name: "Bhopal Waste Managers", location: [23.2599, 77.4126], types: ["hazardous", "medical"], contact: "+91 98765 43245", rating: 4.8 }, // Bhopal
    { id: 37, name: "Jabalpur Green Steps", location: [23.1815, 79.9864], types: ["paper", "plastic", "organic"], contact: "+91 98765 43246", rating: 4.0 }, // Jabalpur
    { id: 38, name: "Gwalior Recycle Hub", location: [26.2183, 78.1828], types: ["glass", "metal"], contact: "+91 98765 43247", rating: 4.3 }, // Gwalior
    { id: 39, name: "Bareilly Zero Waste", location: [28.3670, 79.4304], types: ["textile", "electronic"], contact: "+91 98765 43248", rating: 4.1 }, // Bareilly
    { id: 40, name: "Moradabad Eco Recyclers", location: [28.8384, 78.7735], types: ["plastic", "paper"], contact: "+91 98765 43249", rating: 3.7 }, // Moradabad
    { id: 41, name: "Meerut Waste Solutions", location: [28.9845, 77.7064], types: ["electronic", "mass collect"], contact: "+91 98765 43250", rating: 4.4 }, // Meerut
    { id: 42, name: "Aligarh Clean Environment", location: [27.8974, 78.0880], types: ["metal", "glass"], contact: "+91 98765 43251", rating: 4.2 }, // Aligarh
    { id: 43, name: "Ghaziabad Green Planet", location: [28.6692, 77.4538], types: ["paper", "plastic", "battery"], contact: "+91 98765 43252", rating: 4.5 }, // Ghaziabad
    { id: 44, name: "Faridabad Eco Warriors", location: [28.4089, 77.3178], types: ["electronic", "rubber"], contact: "+91 98765 43253", rating: 4.6 }, // Faridabad
    { id: 45, name: "Gurugram Waste Experts", location: [28.4595, 77.0266], types: ["hazardous", "medical"], contact: "+91 98765 43254", rating: 4.9 }, // Gurugram
    { id: 46, name: "Noida Green Disposal", location: [28.5355, 77.3910], types: ["electronic", "plastic", "glass"], contact: "+91 98765 43255", rating: 4.7 }, // Noida
    { id: 47, name: "Dehradun Eco Care", location: [30.3165, 78.0322], types: ["paper", "textile", "organic"], contact: "+91 98765 43256", rating: 4.3 }, // Dehradun
    { id: 48, name: "Amritsar Recycling", location: [31.6340, 74.8723], types: ["metal", "plastic"], contact: "+91 98765 43257", rating: 4.0 }, // Amritsar
    { id: 49, name: "Ludhiana Green Future", location: [30.9010, 75.8573], types: ["electronic", "glass", "mass collect"], contact: "+91 98765 43258", rating: 4.1 }, // Ludhiana
    { id: 50, name: "Jalandhar Clean City", location: [31.3260, 75.5762], types: ["paper", "textile"], contact: "+91 98765 43259", rating: 4.2 } // Jalandhar
  ];
  const wasteTypes = [
    'electronic', 'plastic', 'metal', 'medical', 
    'paper', 'organic', 'glass', 'textile', 'hazardous', 'mass collect'
  ];

  // Get user's current location
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
        setUserLocation([latitude, longitude]);
        setLoading(false);
        findNearestCollector([latitude, longitude]);
      },
      (error) => {
        setError('Location access denied. Please enter address manually.');
        setLoading(false);
      }
    );
  };

  // Fetch location suggestions with debouncing
  const fetchLocationSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setSuggestionsLoading(true);
    
    try {
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
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Handle address input change with debouncing
  const handleAddressInputChange = (event, newValue) => {
    setAddress(newValue);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debouncing
    searchTimeoutRef.current = setTimeout(() => {
      fetchLocationSuggestions(newValue);
    }, 300);
  };

  // Handle selection from dropdown
  const handleLocationSelect = (event, newValue) => {
    if (newValue && typeof newValue === 'object') {
      setAddress(newValue.label);
      const location = [newValue.lat, newValue.lon];
      setUserLocation(location);
      findNearestCollector(location);
      setLocationSuggestions([]);
    }
  };

  // Geocode address using Nominatim API (fallback for manual search)
  const geocodeAddress = async () => {
    if (!address.trim()) {
      setError('Please enter a valid address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=in`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const location = [lat, lon];
        setUserLocation(location);
        findNearestCollector(location);
      } else {
        setError('Address not found. Please try again.');
      }
    } catch (error) {
      setError('Failed to find address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Find nearest collector based on waste type
  const findNearestCollector = (location) => {
    const availableCollectors = collectors.filter(c => 
      c.types.includes(selectedWasteType)
    );

    if (availableCollectors.length === 0) {
      setError(`No collectors found for ${selectedWasteType} waste`);
      setNearestCollector(null);
      return;
    }

    let nearest = null;
    let minDistance = Infinity;

    availableCollectors.forEach(collector => {
      const distance = calculateDistance(location, collector.location);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...collector, distance: distance.toFixed(2) };
      }
    });

    setNearestCollector(nearest);
    setError('');
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

  // Component to handle map centering
  const MapController = ({ center, zoom }) => {
    const map = useMap();
    
    useEffect(() => {
      if (center) {
        map.setView(center, zoom);
      }
    }, [center, zoom, map]);
    
    return null;
  };

  const mapCenter = userLocation || [12.9718, 77.6412]; // Default to Bangalore

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box>
      {/* Controls */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
            Find Nearest Waste Collector
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Waste Type</InputLabel>
                <Select
                  value={selectedWasteType}
                  onChange={(e) => setSelectedWasteType(e.target.value)}
                  label="Waste Type"
                >
                  {wasteTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={getCurrentLocation}
                disabled={loading}
                startIcon={<MyLocation />}
                sx={{ height: '56px' }}
              >
                Use GPS
              </Button>
            </Grid>
            
                         <Grid item xs={12} md={5}>
               <Autocomplete
                 freeSolo
                 fullWidth
                 options={locationSuggestions}
                 getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
                 value={address}
                 onInputChange={handleAddressInputChange}
                 onChange={handleLocationSelect}
                 loading={suggestionsLoading}
                 renderInput={(params) => (
                   <TextField
                     {...params}
                     label="Enter Your Address"
                     placeholder="e.g. MG Road, Bangalore"
                     onKeyPress={(e) => e.key === 'Enter' && geocodeAddress()}
                     InputProps={{
                       ...params.InputProps,
                       endAdornment: (
                         <>
                           {suggestionsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                           {params.InputProps.endAdornment}
                         </>
                       ),
                     }}
                   />
                 )}
                 renderOption={(props, option) => (
                   <Box component="li" {...props} sx={{ display: 'block', p: 1 }}>
                     <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                       {option.label.split(',')[0]}
                     </Typography>
                     <Typography variant="caption" color="textSecondary">
                       {option.label.split(',').slice(1).join(',').trim()}
                     </Typography>
                   </Box>
                 )}
                 noOptionsText={address.length < 3 ? "Type at least 3 characters" : "No locations found"}
               />
             </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={geocodeAddress}
                disabled={loading}
                startIcon={<Search />}
                sx={{ height: '56px' }}
              >
                Find
              </Button>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {nearestCollector && (
            <Paper elevation={2} sx={{ mt: 2, p: 2, bgcolor: 'success.light' }}>
              <Typography variant="h6" color="success.contrastText">
                🎯 Nearest Collector Found!
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography variant="body1" color="success.contrastText">
                      <strong>Name:</strong> {nearestCollector.name}
                    </Typography>
                    <Typography variant="body1" color="success.contrastText">
                      <strong>Distance:</strong> {nearestCollector.distance} km
                    </Typography>
                    <Typography variant="body1" color="success.contrastText">
                      <strong>Contact:</strong> {nearestCollector.contact}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography variant="body1" color="success.contrastText">
                      <strong>Accepts:</strong> {nearestCollector.types.join(', ')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <strong>Rating:</strong>
                      <Chip 
                        label={`⭐ ${nearestCollector.rating}`} 
                        size="small" 
                        sx={{ bgcolor: 'warning.main', color: 'white' }}
                      />
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card elevation={3}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: '500px', position: 'relative' }}>
            <MapContainer
              center={mapCenter}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapController center={mapCenter} zoom={userLocation ? 12 : 10} />
              
              {/* User marker */}
              {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>
                    <div>
                      <strong>Your Location</strong>
                      <br />
                      Lat: {userLocation[0].toFixed(4)}
                      <br />
                      Lng: {userLocation[1].toFixed(4)}
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Collector markers */}
              {collectors.map((collector) => (
                <Marker 
                  key={collector.id} 
                  position={collector.location} 
                  icon={collectorIcon}
                >
                  <Popup>
                    <div>
                      <strong>{collector.name}</strong>
                      <br />
                      <strong>Types:</strong> {collector.types.join(', ')}
                      <br />
                      <strong>Contact:</strong> {collector.contact}
                      <br />
                      <strong>Rating:</strong> ⭐ {collector.rating}
                      {nearestCollector && nearestCollector.id === collector.id && (
                        <div style={{ color: 'green', fontWeight: 'bold', marginTop: '5px' }}>
                          🎯 Nearest for {selectedWasteType}!
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WasteCollectorMap; 