import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  Person,
  AccessTime,
  Notes,
  ReportProblem as ReportIcon, // Added for report button
} from '@mui/icons-material';
import StatusTag from './StatusTag'; 
import WasteTypeBadge from './WasteTypeBadge';


export default function AlertCard({ alert }) {
  const { t } = useTranslation();
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  const handleReportSubmit = async () => {
    const storedUserData = localStorage.getItem('user_data');
    if (!storedUserData) {
        setSnackbar({ open: true, message: t('userDashboard.alertCard.loginRequired'), severity: 'error' });
        return;
    }
    const user = JSON.parse(storedUserData);

    if (!reportDescription.trim()) {
        setSnackbar({ open: true, message: t('userDashboard.alertCard.descriptionRequired'), severity: 'warning' });
        return;
    }

    try {
        const response = await fetch(`/api/alerts/${alert.id}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: reportDescription,
                reportedById: user.id,
            }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        setSnackbar({ open: true, message: t('userDashboard.alertCard.reportSuccess'), severity: 'success' });
        setOpenReportDialog(false);
        setReportDescription('');
    } catch (err) {
        setSnackbar({ open: true, message: err.message || t('userDashboard.alertCard.reportError'), severity: 'error' });
    }
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const collectorName = alert.claimedBy?.name || t('userDashboard.alertCard.notAssigned');

  return (
    <>
      <Card elevation={3} sx={{ mb: 2, '&:hover': { boxShadow: 6 } }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar
              src={alert.imageUrl || `https://placehold.co/100x100/4CAF50/FFFFFF?text=${alert.wasteType.charAt(0)}`}
              variant="rounded"
              sx={{ width: 80, height: 80, bgcolor: 'primary.light', fontSize: '2rem' }}
            >
              🗑️
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1}}>
                    <WasteTypeBadge type={alert.wasteType} />
                    <StatusTag status={alert.status} />
                </Box>
                {/* ADDED: Report Problem Button */}
                <Button 
                    size="small" 
                    variant="outlined" 
                    color="error" 
                    startIcon={<ReportIcon />}
                    onClick={() => setOpenReportDialog(true)}
                >
                    {t('userDashboard.alertCard.report')}
                </Button>
              </Box>

              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('userDashboard.alertCard.collector')}: {collectorName}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('userDashboard.alertCard.location')}: {alert.pickupAddress}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(alert.createdAt)}
                  </Typography>
                </Box>

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

      {/* ADDED: Report Problem Dialog */}
      <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('userDashboard.alertCard.reportProblem')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('userDashboard.alertCard.reportDescription')}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="description"
            label={t('userDashboard.alertCard.problemDescription')}
            type="text"
            fullWidth
            multiline
            rows={4}
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)}>{t('userDashboard.alertCard.cancel')}</Button>
          <Button onClick={handleReportSubmit} variant="contained" color="primary">
            {t('userDashboard.alertCard.submitReport')}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
