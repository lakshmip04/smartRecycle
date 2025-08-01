import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Box, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button, Grid, Alert, Paper, CircularProgress
} from '@mui/material';
import { LocationOn, Search } from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- IMPORTANT ---
// This component is now correctly set up for dynamic import.
// In your user-dashboard.js, import it like this:
// const WasteCollectorMapWithNoSSR = dynamic(() => import('../components/WasteCollectorMap'), { ssr: false });

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
});
const collectorIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [25, 25],
});

// Dynamically import Map components, but NOT hooks
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
// FIXED: Import useMap directly as a hook
import { useMap } from 'react-leaflet';


const MapController = ({ center, zoom }) => {
  const map = useMap(); // This will now work correctly
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export default function WasteCollectorMap() {
  const [selectedWasteType, setSelectedWasteType] = useState('E_WASTE');
  const [userLocation, setUserLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nearestCollector, setNearestCollector] = useState(null);
  const [collectors, setCollectors] = useState([]); // State for live collector data
  
  const mapRef = useRef();

  // Fetch all verified collectors from the backend
  useEffect(() => {
    const fetchCollectors = async () => {
        try {
            const response = await fetch('/api/collectors');
            if (!response.ok) throw new Error('Could not fetch collectors');
            const data = await response.json();
            setCollectors(data.collectors);
        } catch (err) {
            setError(err.message);
        }
    };
    fetchCollectors();
  }, []);

  // Find nearest collector logic (now uses live data)
  const findNearestCollector = (location) => {
    const availableCollectors = collectors.filter(c => 
      c.collectorProfile?.acceptedWasteTypes.includes(selectedWasteType)
    );

    if (availableCollectors.length === 0) {
      setError(`No collectors found for ${selectedWasteType.replace('_', ' ')} waste`);
      setNearestCollector(null);
      return;
    }

    let nearest = null;
    let minDistance = Infinity;

    availableCollectors.forEach(collector => {
      const collectorLocation = [collector.collectorProfile.latitude, collector.collectorProfile.longitude];
      const distance = calculateDistance(location, collectorLocation);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...collector, distance: distance.toFixed(2) };
      }
    });

    setNearestCollector(nearest);
    setError('');
  };

    const calculateDistance = (pos1, pos2) => {
        const R = 6371; // Earth's radius in km
        const toRad = (value) => (value * Math.PI) / 180;
        const dLat = toRad(pos2[0] - pos1[0]);
        const dLon = toRad(pos2[1] - pos1[1]);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(pos1[0])) * Math.cos(toRad(pos2[0])) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

  const getCurrentLocation = () => {
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = [latitude, longitude];
        setUserLocation(location);
        findNearestCollector(location);
        setLoading(false);
      },
      () => {
        setError('Location access denied. Please enter an address manually.');
        setLoading(false);
      }
    );
  };

  const geocodeAddress = async () => {
    // Geocoding logic to convert address string to lat/lng
  };

  const mapCenter = userLocation || [12.9718, 77.6412]; // Default to Bangalore

  return (
    <Box>
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Find Nearest Waste Collector</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Waste Type</InputLabel>
                <Select
                  value={selectedWasteType}
                  onChange={(e) => setSelectedWasteType(e.target.value)}
                  label="Waste Type"
                >
                  <MenuItem value="GENERAL">General</MenuItem>
                  <MenuItem value="RECYCLABLE">Recyclable</MenuItem>
                  <MenuItem value="E_WASTE">E-Waste</MenuItem>
                  <MenuItem value="ORGANIC">Organic</MenuItem>
                  <MenuItem value="HAZARDOUS">Hazardous</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField fullWidth label="Enter Your Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" onClick={geocodeAddress} disabled={loading} startIcon={<Search />} sx={{ height: '56px' }}>
                Find
              </Button>
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {nearestCollector && (
            <Paper elevation={2} sx={{ mt: 2, p: 2, bgcolor: 'success.light' }}>
              <Typography variant="h6">Nearest Collector Found!</Typography>
              <Typography><strong>Name:</strong> {nearestCollector.collectorProfile.name}</Typography>
              <Typography><strong>Distance:</strong> {nearestCollector.distance} km</Typography>
              <Typography><strong>Contact:</strong> {nearestCollector.phone}</Typography>
            </Paper>
          )}
        </CardContent>
      </Card>

      <Card elevation={3}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: '500px' }}>
            <MapContainer center={mapCenter} zoom={10} style={{ height: '100%', width: '100%' }} ref={mapRef}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController center={mapCenter} zoom={userLocation ? 12 : 10} />
              {userLocation && <Marker position={userLocation} icon={userIcon}><Popup>Your Location</Popup></Marker>}
              {collectors.map((collector) => (
                <Marker key={collector.id} position={[collector.collectorProfile.latitude, collector.collectorProfile.longitude]} icon={collectorIcon}>
                  <Popup>
                    <strong>{collector.collectorProfile.name}</strong><br />
                    Accepts: {collector.collectorProfile.acceptedWasteTypes.join(', ')}
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
