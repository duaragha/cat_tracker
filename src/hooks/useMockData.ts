import { useCallback } from 'react';
import { useCatData } from '../contexts/CatDataContext';

// Mock data that works without backend
export const useMockData = () => {
  const { } = useCatData(); // Remove unused catProfile variable

  const generateMockData = useCallback(async () => {
    try {
      // Instead of API calls, we'll use localStorage to simulate data persistence

      // Create test profile data
      const mockProfile = {
        id: 'test-cat-1',
        name: 'Whiskers',
        breed: 'Tabby',
        color: 'Orange',
        birthDate: new Date('2020-03-15'),
        gotchaDate: new Date('2020-06-01'),
        weight: 4.5,
        microchipId: 'TEST123456789',
        veterinarian: 'Dr. Smith',
        notes: 'Loves tuna and sunny spots',
        photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Generate mock entries for the last 7 days
      const now = new Date();
      const mockData = {
        washroomEntries: [] as any[],
        foodEntries: [] as any[],
        sleepEntries: [] as any[],
        weightEntries: [] as any[],
        treatEntries: [] as any[]
      };

      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Add washroom entries (2-4 per day)
        const washroomCount = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < washroomCount; j++) {
          const timestamp = new Date(date);
          timestamp.setHours(Math.floor(Math.random() * 16) + 6);
          timestamp.setMinutes(Math.floor(Math.random() * 60));

          mockData.washroomEntries.push({
            id: `washroom-${i}-${j}`,
            catId: 'test-cat-1',
            timestamp,
            type: Math.random() > 0.7 ? 'urine' : 'feces',
            consistency: ['firm', 'soft', 'loose', 'liquid'][Math.floor(Math.random() * 4)],
            hasBlood: Math.random() > 0.9,
            color: ['brown', 'dark brown', 'light brown', 'yellow'][Math.floor(Math.random() * 4)],
            photos: [],
            notes: Math.random() > 0.7 ? 'Normal bowel movement' : '',
            createdAt: new Date()
          });
        }

        // Add food entries (2-3 per day)
        const foodCount = Math.floor(Math.random() * 2) + 2;
        for (let j = 0; j < foodCount; j++) {
          const timestamp = new Date(date);
          timestamp.setHours([7, 12, 18][j] || 19);
          timestamp.setMinutes(Math.floor(Math.random() * 30));

          mockData.foodEntries.push({
            id: `food-${i}-${j}`,
            catId: 'test-cat-1',
            timestamp,
            foodCategory: Math.random() > 0.7 ? 'Wet' : 'Dry',
            foodType: ['Chicken', 'Salmon', 'Tuna', 'Turkey', 'Beef'][Math.floor(Math.random() * 5)],
            brand: ['Royal Canin', 'Hill\'s', 'Purina', 'Blue Buffalo'][Math.floor(Math.random() * 4)],
            amount: Math.floor(Math.random() * 5) + 3,
            unit: 'portions',
            portionToGrams: 12,
            notes: Math.random() > 0.8 ? 'Ate enthusiastically' : '',
            createdAt: new Date()
          });
        }

        // Add sleep entries (2-4 per day)
        const sleepCount = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < sleepCount; j++) {
          const startTime = new Date(date);
          startTime.setHours(Math.floor(Math.random() * 20) + 2);
          startTime.setMinutes(Math.floor(Math.random() * 60));

          const endTime = new Date(startTime);
          const durationMins = Math.floor(Math.random() * 180) + 30;
          endTime.setMinutes(endTime.getMinutes() + durationMins);

          mockData.sleepEntries.push({
            id: `sleep-${i}-${j}`,
            catId: 'test-cat-1',
            startTime,
            endTime,
            duration: durationMins,
            quality: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)],
            location: ['couch', 'bed', 'cat tree', 'windowsill', 'carpet'][Math.floor(Math.random() * 5)],
            photos: [],
            notes: Math.random() > 0.8 ? 'Deep sleep' : '',
            createdAt: new Date()
          });
        }

        // Add treat entries (0-2 per day)
        const treatCount = Math.floor(Math.random() * 3);
        for (let j = 0; j < treatCount; j++) {
          const timestamp = new Date(date);
          timestamp.setHours(Math.floor(Math.random() * 12) + 10);
          timestamp.setMinutes(Math.floor(Math.random() * 60));

          mockData.treatEntries.push({
            id: `treat-${i}-${j}`,
            catId: 'test-cat-1',
            timestamp,
            treatType: ['Training treats', 'Dental treats', 'Freeze-dried', 'Catnip treats'][Math.floor(Math.random() * 4)],
            brand: ['Friskies', 'Temptations', 'Blue Buffalo', 'Wellness'][Math.floor(Math.random() * 4)],
            quantity: Math.floor(Math.random() * 5) + 1,
            calories: Math.floor(Math.random() * 20) + 5,
            purpose: ['training', 'reward', 'dental health', 'just because'][Math.floor(Math.random() * 4)],
            notes: Math.random() > 0.8 ? 'Really enjoyed these' : '',
            createdAt: new Date()
          });
        }
      }

      // Add weight entries (once every few days)
      for (let i = 0; i < 3; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 2));
        date.setHours(9, 0, 0, 0);

        mockData.weightEntries.push({
          id: `weight-${i}`,
          catId: 'test-cat-1',
          measurementDate: date,
          weight: 4.3 + (Math.random() * 0.4), // 4.3-4.7 kg
          unit: 'kg',
          notes: i === 0 ? 'Regular check-up' : '',
          createdAt: new Date()
        });
      }

      // Store mock data in localStorage
      localStorage.setItem('cat-tracker-profile', JSON.stringify(mockProfile));
      localStorage.setItem('cat-tracker-data', JSON.stringify(mockData));

      console.log('✅ Mock data generated and stored locally!');
      console.log('📊 Generated data:', {
        washroom: mockData.washroomEntries.length,
        food: mockData.foodEntries.length,
        sleep: mockData.sleepEntries.length,
        weight: mockData.weightEntries.length,
        treats: mockData.treatEntries.length
      });

      return { profile: mockProfile, data: mockData };
    } catch (error) {
      console.error('❌ Failed to generate mock data:', error);
      return null;
    }
  }, []);

  const clearMockData = useCallback(() => {
    localStorage.removeItem('cat-tracker-profile');
    localStorage.removeItem('cat-tracker-data');
    console.log('🗑️ Mock data cleared from localStorage');
  }, []);

  return { generateMockData, clearMockData };
};