import React from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
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

// Define a color palette for the chart segments
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0'];

// Custom Tooltip for showing percentages
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 2, background: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="body2">{`${payload[0].name} : ${payload[0].value} kg (${(payload[0].percent * 100).toFixed(0)}%)`}</Typography>
      </Paper>
    );
  }
  return null;
};


export default function AnalyticsDashboard({ analyticsData }) {
  const theme = useTheme();

  if (!analyticsData || !analyticsData.wasteByType || analyticsData.wasteByType.length === 0) {
    return <StyledPaper><Typography>No analytics data available to display.</Typography></StyledPaper>;
  }

  // Recharts PieChart expects a 'value' key, so we map our 'weight' key to 'value'
  const chartData = analyticsData.wasteByType.map(item => ({
      name: item.name,
      value: item.weight,
  }));

  return (
    <Box>
      <StyledPaper sx={{ height: '450px', p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
          Waste Collected by Type (in kg)
        </Typography>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name" 
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </StyledPaper>
    </Box>
  );
}
