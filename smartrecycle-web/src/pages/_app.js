// This import at the very top makes the necessary polyfill available application-wide
import 'regenerator-runtime/runtime';
import '../styles/globals.css';
import '../i18n'; // Initialize i18n
import { Suspense } from 'react';
import AppWrapper from '../App';

function MyApp({ Component, pageProps }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppWrapper>
        <Component {...pageProps} />
      </AppWrapper>
    </Suspense>
  );
}

export default MyApp;
