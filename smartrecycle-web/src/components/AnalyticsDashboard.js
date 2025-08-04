import React from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Grid,
} from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';

const StyledPaper = (props) => (
  <Paper
    elevation={4}
    sx={{
      p: { xs: 2, sm: 3 },
      borderRadius: 4,
      backdropFilter: 'blur(8px)',
      background: 'rgba(255,255,255,0.95)',
      height: '100%',
      ...props.sx,
    }}
    {...props}
  >
    {props.children}
  </Paper>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 2, background: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="body2">{`${label || payload[0].name} : ${payload[0].value}`}</Typography>
      </Paper>
    );
  }
  return null;
};

export default function AnalyticsDashboard({ analyticsData }) {
  const theme = useTheme();

  if (!analyticsData) {
    return <Typography>No analytics data available.</Typography>;
  }

  const pieChartData = analyticsData.wasteByType.map(item => ({
      name: item.name,
      value: item.weight,
  }));

  return (
    <Grid container spacing={3}>
      {/* Pie Chart for Waste Distribution */}
      <Grid item xs={12} md={6}>
        <StyledPaper sx={{ height: '400px' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>Waste Distribution by Weight (kg)</Typography>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}>
                {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </StyledPaper>
      </Grid>

      {/* Bar Chart for Collector Specializations */}
      <Grid item xs={12} md={6}>
        <StyledPaper sx={{ height: '400px' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>Collector Specializations</Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={analyticsData.collectorSpecializations} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Number of Collectors" fill={theme.palette.secondary.main} />
            </BarChart>
          </ResponsiveContainer>
        </StyledPaper>
      </Grid>

      {/* Line Chart for Daily Activity */}
      <Grid item xs={12}>
        <StyledPaper sx={{ height: '400px' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>New Alerts (Last 30 Days)</Typography>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={analyticsData.dailyActivity} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="alerts" stroke={theme.palette.primary.main} strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </StyledPaper>
      </Grid>
    </Grid>
  );
}
