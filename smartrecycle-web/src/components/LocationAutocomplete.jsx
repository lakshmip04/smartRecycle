import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  MyLocation,
  Business,
  Home,
  Place,
} from '@mui/icons-material';

// This is a singleton pattern to ensure the Google Maps script is loaded only once.
let googleMapsScriptLoaded = false;

const LocationAutocomplete = ({ 
  value, 
  onChange,
  onSelect, 
  label = "Address", 
  placeholder = "Enter your address...",
  required = false,
  disabled = false,
  ...textFieldProps 
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  
  const debounceRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Refs for Google Maps services and session token
  const placesService = useRef(null);
  const geocoderService = useRef(null);
  const sessionToken = useRef(null);

  // --- Main Effect for Loading Google Places API ---
  useEffect(() => {
    const loadGooglePlaces = () => {
      if (googleMapsScriptLoaded) {
        // If script is already loaded, just initialize services
        if (window.google?.maps) {
          placesService.current = new window.google.maps.places.AutocompleteService();
          geocoderService.current = new window.google.maps.Geocoder();
        }
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.warn('LocationAutocomplete: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set. The component will operate in fallback mode.');
        return;
      }

      googleMapsScriptLoaded = true; // Set flag to prevent re-loading

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding&callback=initAutocomplete`;
      script.async = true;
      script.defer = true;
      
      // The callback function that Google Maps will call once loaded
      window.initAutocomplete = () => {
        console.log('LocationAutocomplete: Google Maps script loaded successfully.');
        placesService.current = new window.google.maps.places.AutocompleteService();
        geocoderService.current = new window.google.maps.Geocoder();
      };
      
      script.onerror = () => {
        console.error('LocationAutocomplete: Failed to load Google Places API. Check API key, billing, and API restrictions. Falling back to OpenStreetMap.');
        setError('Could not connect to Google Maps.');
      };
      
      document.head.appendChild(script);
    };

    loadGooglePlaces();
  }, []);

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  const fetchGoogleSuggestions = (query) => {
    if (!placesService.current) {
        console.error("LocationAutocomplete: Places Service is not available.");
        return;
    }
    setIsLoading(true);
    setError('');

    // Generate a new session token for each autocomplete session
    if (!sessionToken.current) {
        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
    }

    const request = {
      input: query,
      componentRestrictions: { country: 'in' },
      sessionToken: sessionToken.current,
    };

    placesService.current.getPlacePredictions(request, (predictions, status) => {
      setIsLoading(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setSuggestions(predictions);
        setShowSuggestions(true);
      } else {
        console.error(`LocationAutocomplete: Google Places Autocomplete failed. Status: ${status}`);
        if (status === 'REQUEST_DENIED') {
            setError("API Key Error. Check console for details.");
            console.error("REQUEST_DENIED: Your API key might be invalid, expired, or incorrectly restricted. Check your Google Cloud Console.");
        }
        setSuggestions([]);
        setShowSuggestions(false);
      }
    });
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    
    // Call the onChange prop if provided
    if (onChange) {
      onChange(newValue);
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (newValue.length > 2) {
      debounceRef.current = setTimeout(() => fetchGoogleSuggestions(newValue), 400);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Call the onChange prop if provided
    if (onChange) {
      onChange(suggestion.description);
    }

    if (!geocoderService.current) {
        console.error("LocationAutocomplete: Geocoder Service is not available to fetch coordinates.");
        onSelect({ description: suggestion.description }); // Return description only
        return;
    }

    // Use the Place ID to get detailed information, including coordinates
    geocoderService.current.geocode({ placeId: suggestion.place_id }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            onSelect({
                description: suggestion.description,
                latitude: location.lat(),
                longitude: location.lng(),
            });
        } else {
            console.error(`LocationAutocomplete: Geocode failed for placeId ${suggestion.place_id}. Status: ${status}`);
            onSelect({ description: suggestion.description }); // Fallback
        }
    });

    // A new session starts after a suggestion is selected.
    sessionToken.current = null;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    if (!geocoderService.current) {
        setError('Geocoding service not ready.');
        return;
    }

    setIsLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
                 geocoderService.current.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
             setIsLoading(false);
             if (status === 'OK' && results?.[0]) {
                 const address = results[0].formatted_address;
                 setInputValue(address);
                 
                 // Call the onChange prop if provided
                 if (onChange) {
                   onChange(address);
                 }
                 
                 // Call onSelect with coordinates
                 onSelect({
                   description: address,
                   latitude: latitude,
                   longitude: longitude
                 });
             } else {
                 setError('Could not find address for your location.');
             }
         });
      },
      () => {
        setIsLoading(false);
        setError('Unable to get your location. Please enable location services.');
      }
    );
  };

  const getSuggestionIcon = (types) => {
    if (types.includes('establishment')) return <Business sx={{ color: '#2196F3' }} />;
    if (types.includes('political') || types.includes('locality')) return <Home sx={{ color: '#4CAF50' }} />;
    return <Place sx={{ color: '#757575' }} />;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Box sx={{ position: 'relative' }} ref={suggestionsRef}>
      <TextField
        {...textFieldProps}
        fullWidth
        label={label}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        required={required}
        disabled={disabled}
        error={!!error}
        helperText={error}
        InputProps={{
          endAdornment: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                <MyLocation
                  sx={{ cursor: 'pointer', color: '#4CAF50', '&:hover': { color: '#2E7D32' } }}
                  onClick={getCurrentLocation}
                />
              )}
            </Box>
          ),
        }}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <Paper
          elevation={8}
          sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, maxHeight: 300, overflow: 'auto', mt: 1 }}
        >
          <List dense>
            {suggestions.map((suggestion) => (
              <ListItem key={suggestion.place_id} disablePadding>
                <ListItemButton onClick={() => handleSuggestionSelect(suggestion)}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getSuggestionIcon(suggestion.types)}
                  </ListItemIcon>
                  <ListItemText
                    primary={suggestion.structured_formatting.main_text}
                    secondary={suggestion.structured_formatting.secondary_text}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                    secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default LocationAutocomplete;
