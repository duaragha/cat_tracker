import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load everything except Router for minimal initial bundle
const ChakraAppShell = lazy(() => import('./components/ChakraAppShell'));
const Layout = lazy(() => import('./components/Layout'));
const Dashboard = lazy(() => import(/* webpackPrefetch: true */ './pages/Dashboard'));
const Calendar = lazy(() => import(/* webpackPrefetch: true */ './pages/Calendar'));
const WashroomTracking = lazy(() => import('./pages/WashroomTracking'));
const FoodTracking = lazy(() => import('./pages/FoodTracking'));
const TreatTracking = lazy(() => import('./pages/TreatTracking'));
const SleepTracking = lazy(() => import('./pages/SleepTracking'));
const WeightTracking = lazy(() => import('./pages/WeightTracking'));
const PhotoGallery = lazy(() => import('./pages/PhotoGallery'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const Export = lazy(() => import('./pages/Export'));

// Minimal loading component (no Chakra UI to reduce initial bundle)
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #e2e8f0',
      borderTopColor: '#3182ce',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <ChakraAppShell>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="washroom" element={<WashroomTracking />} />
              <Route path="food" element={<FoodTracking />} />
              <Route path="treats" element={<TreatTracking />} />
              <Route path="sleep" element={<SleepTracking />} />
              <Route path="weight" element={<WeightTracking />} />
              <Route path="photos" element={<PhotoGallery />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<Profile />} />
              <Route path="export" element={<Export />} />
            </Route>
          </Routes>
        </ChakraAppShell>
      </Suspense>
    </Router>
  );
}

export default App;