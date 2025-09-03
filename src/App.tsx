import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CatDataProvider } from './contexts/CatDataContext';
import LoadingWrapper from './components/LoadingWrapper';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WashroomTracking from './pages/WashroomTracking';
import FoodTracking from './pages/FoodTracking';
import SleepTracking from './pages/SleepTracking';
import WeightTracking from './pages/WeightTracking';
import PhotoGallery from './pages/PhotoGallery';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Export from './pages/Export';
import Calendar from './pages/Calendar';
import theme from './theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <CatDataProvider>
        <Router>
          <LoadingWrapper>
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
          </LoadingWrapper>
        </Router>
      </CatDataProvider>
    </ChakraProvider>
  );
}

export default App;