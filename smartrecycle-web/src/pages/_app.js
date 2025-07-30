// This import at the very top makes the necessary polyfill available application-wide
import 'regenerator-runtime/runtime';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
