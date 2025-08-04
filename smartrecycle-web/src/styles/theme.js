import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Create a base theme instance
let theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Your main green color
    },
    secondary: {
      main: '#FF9800', // An accent color
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 'bold',
      color: '#2E7D32',
    },
  },
});

// This is the magic function that makes your font sizes responsive!
theme = responsiveFontSizes(theme);

export default theme;
