import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import {
  LocationOn,
  Person,
  AccessTime,
  Notes
} from '@mui/icons-material';
import StatusTag from './StatusTag'; 
import WasteTypeBadge from './WasteTypeBadge';

// --- Placeholder Components (if you don't have the real ones yet) ---
// const StatusTag = ({ status }) => <Chip label={status} size="small" />;
// const WasteTypeBadge = ({ type }) => <Chip label={type} size="small" color="primary" />;
// --- End of Placeholder Components ---


// The props received from the API will have a different structure than the mock data.
// This updated component is designed to handle the real data.
export default function AlertCard({ alert }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  // The API sends the collector's info in a nested object: `claimedBy.name`
  const collectorName = alert.claimedBy?.name || 'Not assigned';

  return (
    <Card elevation={3} sx={{ mb: 2, '&:hover': { boxShadow: 6 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Image */}
          <Avatar
            src={alert.imageUrl || `https://placehold.co/100x100/4CAF50/FFFFFF?text=${alert.wasteType.charAt(0)}`}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <WasteTypeBadge type={alert.wasteType} />
              <StatusTag status={alert.status} />
            </Box>

            <Stack spacing={1}>
              {/* Collector */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Collector: {collectorName}
                </Typography>
              </Box>

              {/* Location */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {/* The API sends pickupAddress directly */}
                  Location: {alert.pickupAddress}
                </Typography>
              </Box>

              {/* Date */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(alert.createdAt)}
                </Typography>
              </Box>

              {/* Notes/Description */}
              {/* The API sends 'description', not 'notes' */}
              {alert.description && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                  <Notes sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {alert.description}
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
