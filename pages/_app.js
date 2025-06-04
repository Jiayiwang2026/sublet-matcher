import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';

// Global styles
import 'tailwindcss/tailwind.css';
import '@/styles/globals.css';

// Pages that don't need layout (e.g., auth pages, error pages)
const noLayoutPages = ['/auth/login', '/auth/register', '/404', '/500'];

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Check if current page should have layout
  const shouldHaveLayout = !noLayoutPages.includes(router.pathname);

  return (
    <AuthProvider>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {shouldHaveLayout ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
    </AuthProvider>
  );
}

export default MyApp;
