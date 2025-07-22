import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import './ConveyorBelt.css';

const ConveyorBelt = ({ result }) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
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
      textile: '👕',
      hazardous: '⚠️',
      medical: '🏥',
    };
    return icons[wasteType?.toLowerCase()] || '♻️';
  };

  // New layout for 9 bins on a straight path
  const dustbins = [
    // Top Row
    { type: 'organic', top: '5%', left: '10%' },
    { type: 'paper', top: '5%', left: '30%' },
    { type: 'glass', top: '5%', left: '50%' },
    { type: 'metal', top: '5%', left: '70%' },
    { type: 'textile', top: '5%', left: '90%' },
    
    // Bottom Row
    { type: 'other', top: '70%', left: '20%' },
    { type: 'plastic', top: '70%', left: '40%' },
    { type: 'electronic', top: '70%', left: '60%' },
    { type: 'hazardous', top: '70%', left: '80%' },
    { type: 'medical', top: '70%', left: '100%' },
  ];

  const wasteTypeClass = result.waste_type ? result.waste_type.toLowerCase().replace(/[\s-]/g, '') : 'none';

  if (!result || !result.image) {
    return null;
  }

  return (
    <Box className="animation-container">
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <Typography variant="h6" gutterBottom align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
          Sorting Simulation
        </Typography>
        <IconButton
          onClick={() => setAnimationKey(prevKey => prevKey + 1)}
          sx={{ position: 'absolute', right: 0, top: -4 }}
          title="Replay Animation"
        >
          <ReplayIcon />
        </IconButton>
      </Box>

      <Box key={animationKey} className="straight-conveyor-container">
        {/* Simple div for the straight belt */}
        <Box className="conveyor-belt-straight" />

        {/* The item to be animated */}
        <Box className={`waste-item-animated ${wasteTypeClass}`}>
          <img src={result.image} alt="classified waste" className="waste-item-image" />
        </Box>

        {/* Dustbins positioned absolutely */}
        {dustbins.map((bin) => (
          <Box
            key={bin.type}
            className={`dustbin-wrapper ${bin.type} ${wasteTypeClass === bin.type ? 'active' : ''}`}
            style={{ top: bin.top, left: bin.left }}
          >
            <Box className="dustbin-top-lid" />
            <Box className="dustbin-front">
              <Typography variant="h6" className="dustbin-visual-label">
                {getWasteTypeIcon(bin.type)}
              </Typography>
              <Typography variant="caption" className="dustbin-text-label">
                {bin.type.charAt(0).toUpperCase() + bin.type.slice(1)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ConveyorBelt;