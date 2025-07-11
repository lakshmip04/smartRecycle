import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  LocationOn,
  Person,
  AccessTime,
  Notes
} from '@mui/icons-material';
import StatusTag from './StatusTag';
import WasteTypeBadge from './WasteTypeBadge';

function AlertCard({ alert }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCoordinates = (coordinates) => {
    if (Array.isArray(coordinates)) {
      return coordinates.map(coord => Number(coord).toFixed(4)).join(', ');
    }
    return coordinates || 'Unknown';
  };

  return (
    <Card elevation={3} sx={{ mb: 2, '&:hover': { elevation: 6 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Image */}
          <Avatar
            src={alert.imageUrl}
            variant="rounded"
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'primary.light',
              fontSize: '2rem'
            }}
          >
            🗑️
          </Avatar>

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WasteTypeBadge type={alert.wasteType} />
              <StatusTag status={alert.status} />
            </Box>

            <Stack spacing={1}>
              {/* Collector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Collector: {alert.collector || 'Not assigned'}
                </Typography>
              </Box>

              {/* Location */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Location: {formatCoordinates(alert.location?.coordinates)}
                </Typography>
              </Box>

              {/* Date */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(alert.createdAt)}
                </Typography>
              </Box>

              {/* Notes */}
              {alert.notes && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                  <Notes sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {alert.notes}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AlertCard; 