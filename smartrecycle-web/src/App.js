import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Screens
import LoginScreen from './screens/LoginScreen';
import DashboardLayout from './components/DashboardLayout';
import AvailableMaterialsScreen from './screens/AvailableMaterialsScreen';
import MyCollectionsScreen from './screens/MyCollectionsScreen';
import MaterialDetailsScreen from './screens/MaterialDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard/materials" replace />} />
              <Route path="materials" element={<AvailableMaterialsScreen />} />
              <Route path="collections" element={<MyCollectionsScreen />} />
              <Route path="profile" element={<ProfileScreen />} />
            </Route>
            <Route path="/material/:id" element={<MaterialDetailsScreen />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 