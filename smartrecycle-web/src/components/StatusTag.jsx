import React from 'react';
import { Chip } from '@mui/material';
import { Schedule, CheckCircle, LocalShipping } from '@mui/icons-material';

function StatusTag({ status }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending':
        return {
          color: 'warning',
          icon: <Schedule />,
          bgcolor: 'warning.light',
          textColor: 'warning.contrastText'
        };
      case 'Accepted':
        return {
          color: 'info',
          icon: <CheckCircle />,
          bgcolor: 'info.light',
          textColor: 'info.contrastText'
        };
      case 'Collected':
        return {
          color: 'success',
          icon: <LocalShipping />,
          bgcolor: 'success.light',
          textColor: 'success.contrastText'
        };
      default:
        return {
          color: 'default',
          icon: <Schedule />,
          bgcolor: 'grey.300',
          textColor: 'text.primary'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={status}
      icon={config.icon}
      sx={{
        bgcolor: config.bgcolor,
        color: config.textColor,
        fontWeight: 'bold',
        '& .MuiChip-icon': {
          color: config.textColor
        }
      }}
      size="small"
    />
  );
}

export default StatusTag; 