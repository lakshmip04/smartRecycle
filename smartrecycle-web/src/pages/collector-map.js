import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic'; // Import dynamic from next
import {
  Box, Card, CardContent, Typography, Button, Grid, Alert, Paper, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Divider, IconButton, CircularProgress, TextField, Autocomplete
} from '@mui/material';
import {
  LocationOn, MyLocation, Directions, Person, Schedule, LocalShipping, Phone, Close, Navigation, Route
} from '@mui/icons-material';

// --- Leaflet CSS and Routing Machine (client-side only) ---
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Dynamically import the Map component to prevent SSR issues
const MapWithNoSSR = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => <Box sx={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>,
});

export default function CollectorMapPage() {
  const router = useRouter();
  
  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRequests, setUserRequests] = useState([]); // This will hold the live alert data
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // This useEffect hook handles authentication and data fetching
  useEffect(() => {
    const storedUserData = localStorage.getItem('user_data');
    if (!storedUserData) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUserData);
    if (parsedUser.role !== 'COLLECTOR') {
      setError('Access Denied: This page is for collectors only.');
      setLoading(false);
      return;
    }
    setUser(parsedUser);

    const fetchAvailableAlerts = async (collectorId) => {
      try {
        const response = await fetch('/api/alerts', {
          headers: { 'x-user-id': collectorId },
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch available materials.');
        }
        const data = await response.json();
        setUserRequests(data.alerts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (parsedUser?.id) {
      fetchAvailableAlerts(parsedUser.id);
    }
  }, [router]);

  const handleRequestDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialog(true);
  };

  const handleClaimRequest = async (request) => {
    try {
        const response = await fetch(`/api/alerts/${request.id}/claim`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collectorId: user.id }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        setDetailsDialog(false);
        // Redirect to the claimed jobs history page after successful claim
        router.push('/collector-history');

    } catch (err) {
        // You can show a snackbar error here
        console.error("Failed to claim request:", err);
        setError(err.message);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Collection Requests Map</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {/* The Map component is now dynamically loaded */}
        <MapWithNoSSR 
            userRequests={userRequests} 
            onMarkerClick={handleRequestDetails}
        />

        {/* Request Details Dialog */}
        <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Request Details
                <IconButton onClick={() => setDetailsDialog(false)}><Close /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {selectedRequest && (
                    <Stack spacing={2}>
                        <Typography variant="h5">{selectedRequest.wasteType}</Typography>
                        <Typography variant="body1"><strong>Description:</strong> {selectedRequest.description}</Typography>
                        <Typography variant="body2"><strong>Weight:</strong> {selectedRequest.weightEstimate} kg</Typography>
                        <Typography variant="body2"><strong>Address:</strong> {selectedRequest.pickupAddress}</Typography>
                        <Divider />
                        <Typography variant="subtitle2">Contact Person: {selectedRequest.createdBy?.householdProfile?.name}</Typography>
                        {/* You might want to add a way to get the user's phone number in the API response */}
                        <Typography variant="body2">Posted: {new Date(selectedRequest.createdAt).toLocaleString()}</Typography>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setDetailsDialog(false)}>Close</Button>
                <Button onClick={() => handleClaimRequest(selectedRequest)} variant="contained" startIcon={<LocalShipping />}>
                    Claim Request
                </Button>
            </DialogActions>
        </Dialog>
    </Box>
  );
}
