// This import at the very top makes the necessary polyfill available application-wide
import 'regenerator-runtime/runtime';  // Assuming you have a global styles file

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
