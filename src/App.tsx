import React, { Component, Suspense, lazy } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CatDataProvider } from './contexts/CatDataContext.optimized';
import Layout from './components/Layout';
import theme from './theme';
import { Box, Spinner, Text, VStack, Button } from '@chakra-ui/react';

// Lazy load all page components for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard.optimized'));
const Calendar = lazy(() => import('./pages/Calendar.optimized'));
const WashroomTracking = lazy(() => import('./pages/WashroomTracking'));
const FoodTracking = lazy(() => import('./pages/FoodTracking'));
const TreatTracking = lazy(() => import('./pages/TreatTracking'));
const SleepTracking = lazy(() => import('./pages/SleepTracking'));
const WeightTracking = lazy(() => import('./pages/WeightTracking'));
const PhotoGallery = lazy(() => import('./pages/PhotoGallery'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const Export = lazy(() => import('./pages/Export'));

// Loading component for suspense
const PageLoader = () => (
  <VStack spacing={4} justify="center" align="center" minH="400px">
    <Spinner size="xl" color="blue.500" thickness="4px" />
    <Text color="gray.600">Loading...</Text>
  </VStack>
);

// Error boundary component
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={8} textAlign="center">
          <VStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold" color="red.500">
              Something went wrong
            </Text>
            <Text color="gray.600">
              Please refresh the page or try again later.
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => this.setState({ hasError: false })}
            >
              Try Again
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary>
        <CatDataProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route
                  index
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Dashboard />
                    </Suspense>
                  }
                />
                <Route
                  path="calendar"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Calendar />
                    </Suspense>
                  }
                />
                <Route
                  path="washroom"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <WashroomTracking />
                    </Suspense>
                  }
                />
                <Route
                  path="food"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <FoodTracking />
                    </Suspense>
                  }
                />
                <Route
                  path="treats"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <TreatTracking />
                    </Suspense>
                  }
                />
                <Route
                  path="sleep"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <SleepTracking />
                    </Suspense>
                  }
                />
                <Route
                  path="weight"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <WeightTracking />
                    </Suspense>
                  }
                />
                <Route
                  path="photos"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <PhotoGallery />
                    </Suspense>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Analytics />
                    </Suspense>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Profile />
                    </Suspense>
                  }
                />
                <Route
                  path="export"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Export />
                    </Suspense>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </CatDataProvider>
      </ErrorBoundary>
    </ChakraProvider>
  );
}

export default App;