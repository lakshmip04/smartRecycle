import React from 'react';
import { Chip } from '@mui/material';
import { 
    Schedule, 
    CheckCircle, 
    LocalShipping, 
    TaskAlt, // A better icon for 'Completed'
    Cancel, // Icon for 'Cancelled'
} from '@mui/icons-material';

export default function StatusTag({ status }) {
  // This function is now updated to match the status values from your Prisma schema
  const getStatusConfig = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDING':
        return {
          label: 'Pending',
          color: 'warning',
          icon: <Schedule />,
        };
      case 'CLAIMED':
        return {
          label: 'Claimed',
          color: 'info',
          icon: <CheckCircle />,
        };
      case 'IN_TRANSIT':
        return {
          label: 'In Transit',
          color: 'primary',
          icon: <LocalShipping />,
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          color: 'success',
          icon: <TaskAlt />,
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: 'error',
          icon: <Cancel />,
        };
      default:
        return {
          label: currentStatus || 'Unknown',
          color: 'default',
          icon: <Schedule />,
        };
    }
  };

  const config = getStatusConfig(status);

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
