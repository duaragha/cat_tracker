import { useCallback } from 'react';
import { useCatData } from '../contexts/CatDataContext';

export const useTestData = () => {
  const {
    setCatProfile,
    addWashroomEntry,
    addFoodEntry,
    addSleepEntry,
    addWeightEntry,
    addPhoto,
    addTreatEntry
  } = useCatData();

  const generateTestData = useCallback(async () => {
    try {
      // Create test profile
      await setCatProfile({
        id: 'test-cat-1',
        name: 'Whiskers',
        breed: 'Tabby',
        birthDate: new Date('2020-03-15'),
        gotchaDate: new Date('2020-06-01'),
        weight: 4.5,
        microchipId: 'TEST123456789',
        veterinarian: 'Dr. Smith',
        notes: 'Loves tuna and sunny spots',
        photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Generate test entries for the last 7 days
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Add washroom entries (2-4 per day)
        const washroomCount = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < washroomCount; j++) {
          const timestamp = new Date(date);
          timestamp.setHours(Math.floor(Math.random() * 16) + 6); // 6 AM to 10 PM
          timestamp.setMinutes(Math.floor(Math.random() * 60));

          await addWashroomEntry({
            timestamp,
            type: Math.random() > 0.7 ? 'pee' : 'pooper',
            consistency: ['firm', 'soft', 'half n half', 'diarrhea'][Math.floor(Math.random() * 4)] as 'firm' | 'soft' | 'half n half' | 'diarrhea',
            hasBlood: Math.random() > 0.9,
            color: ['brown', 'dark brown', 'light brown', 'yellow'][Math.floor(Math.random() * 4)] as 'yellow' | 'green' | 'light brown' | 'brown' | 'dark brown' | 'black' | 'other',
            photos: [],
            notes: Math.random() > 0.7 ? 'Normal bowel movement' : ''
          });
        }

        // Add food entries (2-3 per day)
        const foodCount = Math.floor(Math.random() * 2) + 2;
        for (let j = 0; j < foodCount; j++) {
          const timestamp = new Date(date);
          timestamp.setHours([7, 12, 18][j] || 19); // Breakfast, lunch, dinner
          timestamp.setMinutes(Math.floor(Math.random() * 30));

          await addFoodEntry({
            timestamp,
            foodCategory: Math.random() > 0.7 ? 'Wet' : 'Dry',
            foodType: ['Chicken', 'Salmon', 'Tuna', 'Turkey', 'Beef'][Math.floor(Math.random() * 5)],
            brand: ['Royal Canin', 'Hill\'s', 'Purina', 'Blue Buffalo'][Math.floor(Math.random() * 4)],
            amount: Math.floor(Math.random() * 5) + 3,
            unit: 'portions',
            portionToGrams: 12,
            notes: Math.random() > 0.8 ? 'Ate enthusiastically' : ''
          });
        }

        // Add sleep entries (2-4 per day)
        const sleepCount = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < sleepCount; j++) {
          const startTime = new Date(date);
          startTime.setHours(Math.floor(Math.random() * 20) + 2); // 2 AM to 10 PM
          startTime.setMinutes(Math.floor(Math.random() * 60));

          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + Math.floor(Math.random() * 180) + 30); // 30-210 min naps

          await addSleepEntry({
            startTime,
            endTime,
            quality: ['restful', 'normal', 'restless'][Math.floor(Math.random() * 3)] as 'restful' | 'normal' | 'restless',
            location: ['Couch', 'Bed', 'Cat Tree', 'Window', 'Floor'][Math.floor(Math.random() * 5)] as 'Cat Bed' | 'Bed' | 'Cat Tree' | 'Couch' | 'Floor' | 'Window' | 'Other',
            photos: [],
            notes: Math.random() > 0.8 ? 'Deep sleep' : ''
          });
        }

        // Add treat entries (0-2 per day)
        const treatCount = Math.floor(Math.random() * 3);
        for (let j = 0; j < treatCount; j++) {
          const timestamp = new Date(date);
          timestamp.setHours(Math.floor(Math.random() * 12) + 10); // 10 AM to 10 PM
          timestamp.setMinutes(Math.floor(Math.random() * 60));

          await addTreatEntry({
            timestamp,
            treatType: ['Training treats', 'Dental treats', 'Freeze-dried', 'Catnip treats'][Math.floor(Math.random() * 4)],
            brand: ['Friskies', 'Temptations', 'Blue Buffalo', 'Wellness'][Math.floor(Math.random() * 4)],
            quantity: Math.floor(Math.random() * 5) + 1,
            calories: Math.floor(Math.random() * 20) + 5,
            purpose: ['training', 'reward', 'dental', 'just because'][Math.floor(Math.random() * 4)] as 'reward' | 'training' | 'medication' | 'dental' | 'just because',
            notes: Math.random() > 0.8 ? 'Really enjoyed these' : ''
          });
        }
      }

      // Add weight entries (once every few days)
      for (let i = 0; i < 3; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 2));
        date.setHours(9, 0, 0, 0);

        await addWeightEntry({
          measurementDate: date,
          weight: 4.3 + (Math.random() * 0.4), // 4.3-4.7 kg
          notes: i === 0 ? 'Regular check-up' : ''
        });
      }

      console.log('✅ Test data generated successfully!');
      return true;
    } catch (error) {
      console.error('❌ Failed to generate test data:', error);
      return false;
    }
  }, [setCatProfile, addWashroomEntry, addFoodEntry, addSleepEntry, addWeightEntry, addPhoto, addTreatEntry]);

  return { generateTestData };
};