// This import at the very top makes the necessary polyfill available application-wide
import 'regenerator-runtime/runtime';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../styles/theme'; // Import your new theme
import '../styles/globals.css';
import '../i18n'; // Initialize i18n
import { Suspense } from 'react';
import AppWrapper from '../App';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <Suspense fallback={<div>Loading...</div>}>
        <AppWrapper>
          <Component {...pageProps} />
        </AppWrapper>
      </Suspense>
    </ThemeProvider>
  );
}

export default MyApp;
