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
  Typography,
  Chip,
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  Business,
  Home,
  Place,
} from '@mui/icons-material';

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
  
  // Initialize Google Places service
  const placesService = useRef(null);
  const isGoogleLoaded = useRef(false);

  useEffect(() => {
    // Load Google Places API
    const loadGooglePlaces = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        isGoogleLoaded.current = true;
        placesService.current = new window.google.maps.places.AutocompleteService();
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkGoogleLoaded = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            isGoogleLoaded.current = true;
            placesService.current = new window.google.maps.places.AutocompleteService();
            clearInterval(checkGoogleLoaded);
          }
        }, 100);
        return;
      }

      // Load the Google Places API script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => {
        isGoogleLoaded.current = true;
        placesService.current = new window.google.maps.places.AutocompleteService();
      };
      script.onerror = () => {
        setError('Failed to load Google Places API');
      };
      document.head.appendChild(script);
    };

    loadGooglePlaces();
  }, []);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Handle input change with debouncing
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    if (newValue.length > 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(newValue);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Fetch suggestions from Google Places API
  const fetchSuggestions = async (query) => {
    if (!isGoogleLoaded.current || !placesService.current) {
      // Fallback to a simple API if Google Places is not available
      await fetchFallbackSuggestions(query);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const request = {
        input: query,
        componentRestrictions: { country: 'in' }, // Restrict to India
        types: ['establishment', 'geocode'], // Include both places and addresses
      };

      placesService.current.getPlacePredictions(request, (predictions, status) => {
        setIsLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const formattedSuggestions = predictions.map((prediction) => ({
            id: prediction.place_id,
            description: prediction.description,
            structuredFormatting: prediction.structured_formatting,
            types: prediction.types,
          }));
          setSuggestions(formattedSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Error fetching location suggestions');
      setIsLoading(false);
      // Fallback to simple suggestions
      await fetchFallbackSuggestions(query);
    }
  };

  // Fallback suggestion system when Google Places is not available
  const fetchFallbackSuggestions = async (query) => {
    setIsLoading(true);
    try {
      // Using Nominatim (OpenStreetMap) as fallback
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        const formattedSuggestions = data.map((item, index) => ({
          id: `fallback_${index}`,
          description: item.display_name,
          structuredFormatting: {
            main_text: item.name || item.display_name.split(',')[0],
            secondary_text: item.display_name,
          },
          types: ['fallback'],
          lat: item.lat,
          lon: item.lon,
        }));
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('Fallback API error:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setIsLoading(false);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (onChange) {
      onChange(suggestion.description);
    }
    
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address from coordinates
          if (isGoogleLoaded.current && window.google.maps.Geocoder) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                setIsLoading(false);
                if (status === 'OK' && results[0]) {
                  const address = results[0].formatted_address;
                  setInputValue(address);
                  if (onChange) onChange(address);
                  if (onSelect) onSelect({ 
                    description: address, 
                    lat: latitude, 
                    lng: longitude 
                  });
                } else {
                  setInputValue(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                  if (onChange) onChange(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                }
              }
            );
          } else {
            // Fallback using Nominatim for reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();
            const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setInputValue(address);
            if (onChange) onChange(address);
            if (onSelect) onSelect({ description: address, lat: latitude, lng: longitude });
            setIsLoading(false);
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          setInputValue(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          if (onChange) onChange(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        setError('Unable to get your location. Please enter address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Get icon for suggestion type
  const getSuggestionIcon = (types) => {
    if (types.includes('establishment')) return <Business sx={{ color: '#2196F3' }} />;
    if (types.includes('political')) return <Home sx={{ color: '#4CAF50' }} />;
    return <Place sx={{ color: '#757575' }} />;
  };

  // Handle click outside to close suggestions
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
              {!isGoogleLoaded.current && !error && (
                <Chip 
                  label="Fallback Mode" 
                  size="small" 
                  color="warning" 
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
              {isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <MyLocation
                  sx={{ 
                    cursor: 'pointer', 
                    color: '#4CAF50',
                    '&:hover': { color: '#2E7D32' }
                  }}
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
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 300,
            overflow: 'auto',
            mt: 1,
          }}
        >
          <List dense>
            {suggestions.map((suggestion) => (
              <ListItem key={suggestion.id} disablePadding>
                <ListItemButton onClick={() => handleSuggestionSelect(suggestion)}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getSuggestionIcon(suggestion.types)}
                  </ListItemIcon>
                  <ListItemText
                    primary={suggestion.structuredFormatting?.main_text || suggestion.description}
                    secondary={suggestion.structuredFormatting?.secondary_text}
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontWeight: 'bold' 
                    }}
                    secondaryTypographyProps={{ 
                      variant: 'caption',
                      sx: { 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '300px'
                      }
                    }}
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