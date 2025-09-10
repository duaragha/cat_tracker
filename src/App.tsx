import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CatDataProvider } from './contexts/CatDataContext';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import { Box, Spinner, Center } from '@chakra-ui/react';
import theme from './theme';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Calendar = lazy(() => import('./pages/Calendar'));
const WashroomTracking = lazy(() => import('./pages/WashroomTracking'));
const FoodTracking = lazy(() => import('./pages/FoodTracking'));
const SleepTracking = lazy(() => import('./pages/SleepTracking'));
const WeightTracking = lazy(() => import('./pages/WeightTracking'));
const PhotoGallery = lazy(() => import('./pages/PhotoGallery'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const Export = lazy(() => import('./pages/Export'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading component
const PageLoader = () => (
  <Center h="100vh">
    <Spinner size="xl" color="blue.500" thickness="4px" />
  </Center>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <CatDataProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="washroom" element={<WashroomTracking />} />
                  <Route path="food" element={<FoodTracking />} />
                  <Route path="sleep" element={<SleepTracking />} />
                  <Route path="weight" element={<WeightTracking />} />
                  <Route path="photos" element={<PhotoGallery />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="export" element={<Export />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </CatDataProvider>
      </ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;