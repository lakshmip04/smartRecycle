import React from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// A reusable styled Paper component
const StyledPaper = (props) => (
  <Paper
    elevation={4}
    sx={{
      p: { xs: 2, sm: 3 },
      borderRadius: 4,
      backdropFilter: 'blur(8px)',
      background: 'rgba(255,255,255,0.92)',
      height: '100%',
      ...props.sx,
    }}
    {...props}
  >
    {props.children}
  </Paper>
);

export default function AnalyticsDashboard({ analyticsData }) {
  const theme = useTheme();

  if (!analyticsData) {
    return <Typography>No analytics data available.</Typography>;
  }

  return (
    <Box>
      <StyledPaper sx={{ height: '400px', p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>
          Waste Collected by Type (in kg)
        </Typography>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={analyticsData.wasteByType}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="weight" fill={theme.palette.primary.main} />
          </BarChart>
        </ResponsiveContainer>
      </StyledPaper>
    </Box>
  );
}
