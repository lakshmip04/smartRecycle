import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create Material-UI theme with eco-friendly colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
      dark: '#2E7D32',
    },
    secondary: {
      main: '#81C784',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    warning: {
      main: '#FF9800',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function AppWrapper({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
} 