import React from 'react';
import { Chip } from '@mui/material';
import { Nature, Block } from '@mui/icons-material';

function WasteTypeBadge({ type }) {
  const isBiodegradable = type === 'Biodegradable' || type === 'biodegradable';
  
  return (
    <Chip
      label={type}
      icon={isBiodegradable ? <Nature /> : <Block />}
      sx={{
        bgcolor: isBiodegradable ? 'success.main' : 'error.main',
        color: 'white',
        fontWeight: 'bold',
        '& .MuiChip-icon': {
          color: 'white'
        }
      }}
      size="small"
    />
  );
}

export default WasteTypeBadge; 