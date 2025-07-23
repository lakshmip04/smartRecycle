import React from 'react';
import { Chip } from '@mui/material';
import {
  Nature, // Organic
  Recycling, // Recyclable
  DeleteOutline, // General
  Computer, // E-Waste
  Science, // Hazardous
  Apartment, // Construction
  MedicalServices, // Medical
} from '@mui/icons-material';

// This component now maps specific waste types from your database to a unique style.
export default function WasteTypeBadge({ type }) {
  
  const getWasteTypeConfig = (wasteType) => {
    switch (wasteType) {
      case 'ORGANIC':
        return {
          label: 'Organic',
          icon: <Nature />,
          color: 'success',
        };
      case 'RECYCLABLE':
        return {
          label: 'Recyclable',
          icon: <Recycling />,
          color: 'primary',
        };
      case 'E_WASTE':
        return {
          label: 'E-Waste',
          icon: <Computer />,
          color: 'secondary',
        };
      case 'HAZARDOUS':
        return {
          label: 'Hazardous',
          icon: <Science />,
          color: 'error',
        };
      case 'MEDICAL':
        return {
          label: 'Medical',
          icon: <MedicalServices />,
          color: 'error',
        };
      case 'CONSTRUCTION_DEBRIS':
        return {
          label: 'Construction',
          icon: <Apartment />,
          color: 'warning',
        };
      case 'GENERAL':
      default:
        return {
          label: 'General',
          icon: <DeleteOutline />,
          color: 'default',
        };
    }
  };

  const config = getWasteTypeConfig(type);

  return (
    <Chip
      label={config.label}
      icon={config.icon}
      color={config.color}
      size="small"
      sx={{ fontWeight: 'medium' }}
    />
  );
}
