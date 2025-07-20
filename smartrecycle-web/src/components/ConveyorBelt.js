import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import './ConveyorBelt.css';

const ConveyorBelt = ({ result }) => {
  // A key to force re-rendering and re-starting the animation
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // When a new result comes in, update the key to restart the animation
    if (result && result.waste_type) {
      setAnimationKey(prevKey => prevKey + 1);
    }
  }, [result]);

  const getWasteTypeIcon = (wasteType) => {
    const icons = {
      plastic: '🥤',
      paper: '📄',
      electronic: '📱',
      'e-waste': '📱',
      glass: '🍾',
      metal: '🔧',
      organic: '🍃',
      cardboard: '📦',
      textile: '👕',
      hazardous: '⚠️',
      medical: '🏥',
    };
    return icons[wasteType?.toLowerCase()] || '♻️';
  };

  const dustbins = ['organic', 'paper', 'plastic', 'glass', 'metal', 'electronic'];
  const wasteTypeClass = result.waste_type ? result.waste_type.toLowerCase().replace('-', '') : 'none';

  // Debug logging
  console.log('ConveyorBelt render:', { result, hasImage: !!result?.image, imageUrl: result?.image });
  
  if (!result || !result.image) {
    console.log('ConveyorBelt: No result or image, returning null');
    return null; // Don't render if there's no result
  }

  return (
    <Box key={animationKey} className="animation-container">
      <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
        Sorting Simulation
      </Typography>

      {/* Conveyor Belt */}
      <Box className="conveyor-belt-visual">
        {/* The Waste Item to be Animated */}
        <Box
          className={`waste-item-animated ${wasteTypeClass}`}
        >
          <img src={result.image} alt="classified waste" className="waste-item-image" />
        </Box>
      </Box>

      {/* Dustbins */}
      <Box className="dustbins-visual-container">
        {dustbins.map((bin) => (
          <Paper
            key={bin}
            elevation={3}
            className={`dustbin-visual ${bin.replace('-', '')} ${wasteTypeClass === bin.replace('-', '') ? 'active' : ''}`}
          >
            <Typography variant="h6" className="dustbin-visual-label">
              {getWasteTypeIcon(bin)} {bin.charAt(0).toUpperCase() + bin.slice(1)}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default ConveyorBelt;