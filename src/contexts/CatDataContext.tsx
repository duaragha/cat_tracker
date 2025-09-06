import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { 
  CatProfile, 
  WashroomEntry, 
  FoodEntry, 
  SleepEntry, 
  WeightEntry, 
  PhotoEntry,
  CatData 
} from '../types';

interface CatDataContextType {
  catProfile: CatProfile | null;
  washroomEntries: WashroomEntry[];
  foodEntries: FoodEntry[];
  sleepEntries: SleepEntry[];
  weightEntries: WeightEntry[];
  photos: PhotoEntry[];
  setCatProfile: (profile: CatProfile) => void;
  addWashroomEntry: (entry: Omit<WashroomEntry, 'id' | 'catId' | 'createdAt'>) => void;
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'catId' | 'createdAt'>) => void;
  addSleepEntry: (entry: Omit<SleepEntry, 'id' | 'catId' | 'createdAt' | 'duration'>) => void;
  addWeightEntry: (entry: Omit<WeightEntry, 'id' | 'catId' | 'createdAt'>) => void;
  addPhoto: (photo: Omit<PhotoEntry, 'id' | 'catId' | 'createdAt'>) => void;
  updateWashroomEntry: (entry: WashroomEntry) => void;
  updateFoodEntry: (entry: FoodEntry) => void;
  updateSleepEntry: (entry: SleepEntry) => void;
  updateWeightEntry: (entry: WeightEntry) => void;
  updateEntry: (type: keyof CatData, id: string, data: any) => void;
  deleteEntry: (type: keyof CatData, id: string) => void;
  clearAllData: () => void;
}

const CatDataContext = createContext<CatDataContextType | undefined>(undefined);

export const useCatData = () => {
  const context = useContext(CatDataContext);
  if (!context) {
    throw new Error('useCatData must be used within a CatDataProvider');
  }
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Convert snake_case from backend to camelCase for frontend
const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;
  
  return Object.keys(obj).reduce((result, key) => {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    result[camelKey] = toCamelCase(obj[key]);
    return result;
  }, {} as any);
};

// Convert camelCase from frontend to snake_case for backend
const toSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;
  
  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = toSnakeCase(obj[key]);
    return result;
  }, {} as any);
};

export const CatDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [catProfile, setCatProfileState] = useState<CatProfile | null>(null);
  const [washroomEntries, setWashroomEntries] = useState<WashroomEntry[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Load all data when profile changes
  useEffect(() => {
    if (catProfile?.id) {
      loadAllData(catProfile.id);
    }
  }, [catProfile?.id]);

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profile`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          const profile = toCamelCase(data);
          profile.birthDate = data.birth_date ? new Date(data.birth_date) : undefined;
          profile.gotchaDate = data.gotcha_date ? new Date(data.gotcha_date) : undefined;
          profile.createdAt = new Date(data.created_at);
          profile.updatedAt = new Date(data.updated_at);
          setCatProfileState(profile);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadAllData = async (catId: string) => {
    try {
      // Load all data types in parallel
      const [washroom, food, sleep, weight, photoData] = await Promise.all([
        fetch(`${API_URL}/washroom/${catId}`).then(r => r.json()),
        fetch(`${API_URL}/food/${catId}`).then(r => r.json()),
        fetch(`${API_URL}/sleep/${catId}`).then(r => r.json()),
        fetch(`${API_URL}/weight/${catId}`).then(r => r.json()),
        fetch(`${API_URL}/photos/${catId}`).then(r => r.json())
      ]);

      // Process washroom entries
      setWashroomEntries(washroom.map((e: any) => {
        const entry = toCamelCase(e);
        entry.timestamp = new Date(e.timestamp);
        entry.createdAt = new Date(e.created_at);
        entry.hasBlood = e.has_blood;
        return entry;
      }));

      // Process food entries
      setFoodEntries(food.map((e: any) => {
        const entry = toCamelCase(e);
        entry.timestamp = new Date(e.timestamp);
        entry.createdAt = new Date(e.created_at);
        return entry;
      }));

      // Process sleep entries
      setSleepEntries(sleep.map((e: any) => {
        const entry = toCamelCase(e);
        entry.startTime = new Date(e.start_time);
        entry.endTime = new Date(e.end_time);
        entry.createdAt = new Date(e.created_at);
        return entry;
      }));

      // Process weight entries
      setWeightEntries(weight.map((e: any) => {
        const entry = toCamelCase(e);
        // Parse date string as local date (YYYY-MM-DD format)
        const [year, month, day] = e.measurement_date.split('T')[0].split('-').map(Number);
        entry.measurementDate = new Date(year, month - 1, day, 12, 0, 0);
        entry.createdAt = new Date(e.created_at);
        return entry;
      }));

      // Process photos
      setPhotos(photoData.map((e: any) => {
        const entry = toCamelCase(e);
        entry.uploadDate = new Date(e.upload_date);
        entry.createdAt = new Date(e.created_at);
        return entry;
      }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const setCatProfile = async (profile: CatProfile) => {
    try {
      // Format dates properly to preserve local dates
      const profileData = {
        ...toSnakeCase(profile),
        birth_date: profile.birthDate ? 
          `${profile.birthDate.getFullYear()}-${String(profile.birthDate.getMonth() + 1).padStart(2, '0')}-${String(profile.birthDate.getDate()).padStart(2, '0')}` : 
          null,
        gotcha_date: profile.gotchaDate ? 
          `${profile.gotchaDate.getFullYear()}-${String(profile.gotchaDate.getMonth() + 1).padStart(2, '0')}-${String(profile.gotchaDate.getDate()).padStart(2, '0')}` : 
          null,
        photo_url: profile.photoUrl || null
      };
      
      const res = await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      
      if (res.ok) {
        const data = await res.json();
        const newProfile = toCamelCase(data);
        newProfile.birthDate = data.birth_date ? new Date(data.birth_date) : undefined;
        newProfile.gotchaDate = data.gotcha_date ? new Date(data.gotcha_date) : undefined;
        newProfile.createdAt = new Date(data.created_at);
        newProfile.updatedAt = new Date(data.updated_at);
        setCatProfileState(newProfile);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const addWashroomEntry = async (entry: Omit<WashroomEntry, 'id' | 'catId' | 'createdAt'>) => {
    if (!catProfile?.id) return;
    
    try {
      const res = await fetch(`${API_URL}/washroom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catId: catProfile.id,
          timestamp: entry.timestamp.toISOString(),
          type: entry.type,
          consistency: entry.consistency,
          hasBlood: entry.hasBlood,
          color: entry.color,
          photos: entry.photos,
          notes: entry.notes
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const newEntry = toCamelCase(data);
        newEntry.timestamp = new Date(data.timestamp);
        newEntry.createdAt = new Date(data.created_at);
        newEntry.hasBlood = data.has_blood;
        setWashroomEntries(prev => [newEntry, ...prev]);
      }
    } catch (error) {
      console.error('Error adding washroom entry:', error);
    }
  };

  const addFoodEntry = async (entry: Omit<FoodEntry, 'id' | 'catId' | 'createdAt'>) => {
    if (!catProfile?.id) return;
    
    try {
      const res = await fetch(`${API_URL}/food`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catId: catProfile.id,
          timestamp: entry.timestamp.toISOString(),
          foodCategory: entry.foodCategory,
          foodType: entry.foodType,
          brand: entry.brand,
          amount: entry.amount,
          unit: entry.unit,
          portionToGrams: entry.portionToGrams,
          notes: entry.notes
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const newEntry = toCamelCase(data);
        newEntry.timestamp = new Date(data.timestamp);
        newEntry.createdAt = new Date(data.created_at);
        setFoodEntries(prev => [newEntry, ...prev]);
      }
    } catch (error) {
      console.error('Error adding food entry:', error);
    }
  };

  const addSleepEntry = async (entry: Omit<SleepEntry, 'id' | 'catId' | 'createdAt' | 'duration'>) => {
    if (!catProfile?.id) return;
    
    try {
      const res = await fetch(`${API_URL}/sleep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catId: catProfile.id,
          startTime: entry.startTime.toISOString(),
          endTime: entry.endTime.toISOString(),
          quality: entry.quality,
          location: entry.location,
          customLocation: entry.customLocation,
          notes: entry.notes
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const newEntry = toCamelCase(data);
        newEntry.startTime = new Date(data.start_time);
        newEntry.endTime = new Date(data.end_time);
        newEntry.createdAt = new Date(data.created_at);
        setSleepEntries(prev => [newEntry, ...prev]);
      }
    } catch (error) {
      console.error('Error adding sleep entry:', error);
    }
  };

  const addWeightEntry = async (entry: Omit<WeightEntry, 'id' | 'catId' | 'createdAt'>) => {
    if (!catProfile?.id) return;
    
    try {
      // Format date as YYYY-MM-DD to preserve the local date
      const localDate = entry.measurementDate;
      const dateStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
      
      const res = await fetch(`${API_URL}/weight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...toSnakeCase(entry),
          catId: catProfile.id,
          measurement_date: dateStr  // Use snake_case for backend
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const newEntry = toCamelCase(data);
        // Parse date string as local date (YYYY-MM-DD format)
        const [year, month, day] = data.measurement_date.split('T')[0].split('-').map(Number);
        newEntry.measurementDate = new Date(year, month - 1, day, 12, 0, 0);
        newEntry.createdAt = new Date(data.created_at);
        setWeightEntries(prev => [newEntry, ...prev]);
      }
    } catch (error) {
      console.error('Error adding weight entry:', error);
    }
  };

  const addPhoto = async (photo: Omit<PhotoEntry, 'id' | 'catId' | 'createdAt'>) => {
    if (!catProfile?.id) return;
    
    try {
      const res = await fetch(`${API_URL}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catId: catProfile.id,
          uploadDate: photo.uploadDate.toISOString(),
          imageUrl: photo.imageUrl,
          week: photo.week,
          year: photo.year,
          caption: photo.caption,
          notes: photo.notes
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const newPhoto = toCamelCase(data);
        newPhoto.uploadDate = new Date(data.upload_date);
        newPhoto.createdAt = new Date(data.created_at);
        setPhotos(prev => [newPhoto, ...prev]);
      }
    } catch (error) {
      console.error('Error adding photo:', error);
    }
  };

  const updateWashroomEntry = async (entry: WashroomEntry) => {
    try {
      const res = await fetch(`${API_URL}/washroom/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...toSnakeCase(entry),
          timestamp: entry.timestamp.toISOString()
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const updatedEntry = toCamelCase(data);
        updatedEntry.timestamp = new Date(data.timestamp);
        updatedEntry.createdAt = new Date(data.created_at);
        updatedEntry.hasBlood = data.has_blood;
        setWashroomEntries(prev => prev.map(e => e.id === entry.id ? updatedEntry : e));
      }
    } catch (error) {
      console.error('Error updating washroom entry:', error);
    }
  };

  const updateFoodEntry = async (entry: FoodEntry) => {
    try {
      const res = await fetch(`${API_URL}/food/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...toSnakeCase(entry),
          timestamp: entry.timestamp.toISOString()
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const updatedEntry = toCamelCase(data);
        updatedEntry.timestamp = new Date(data.timestamp);
        updatedEntry.createdAt = new Date(data.created_at);
        setFoodEntries(prev => prev.map(e => e.id === entry.id ? updatedEntry : e));
      }
    } catch (error) {
      console.error('Error updating food entry:', error);
    }
  };

  const updateSleepEntry = async (entry: SleepEntry) => {
    try {
      const res = await fetch(`${API_URL}/sleep/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...toSnakeCase(entry),
          startTime: entry.startTime.toISOString(),
          endTime: entry.endTime.toISOString()
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const updatedEntry = toCamelCase(data);
        updatedEntry.startTime = new Date(data.start_time);
        updatedEntry.endTime = new Date(data.end_time);
        updatedEntry.createdAt = new Date(data.created_at);
        setSleepEntries(prev => prev.map(e => e.id === entry.id ? updatedEntry : e));
      }
    } catch (error) {
      console.error('Error updating sleep entry:', error);
    }
  };

  const updateWeightEntry = async (entry: WeightEntry) => {
    try {
      // Format date as YYYY-MM-DD to preserve the local date
      const localDate = entry.measurementDate;
      const dateStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
      
      const res = await fetch(`${API_URL}/weight/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...toSnakeCase(entry),
          measurement_date: dateStr
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const updatedEntry = toCamelCase(data);
        // Parse date string as local date (YYYY-MM-DD format)
        const [year, month, day] = data.measurement_date.split('T')[0].split('-').map(Number);
        updatedEntry.measurementDate = new Date(year, month - 1, day, 12, 0, 0);
        updatedEntry.createdAt = new Date(data.created_at);
        setWeightEntries(prev => prev.map(e => e.id === entry.id ? updatedEntry : e));
      }
    } catch (error) {
      console.error('Error updating weight entry:', error);
    }
  };

  const updateEntry = (type: keyof CatData, _id: string, data: any) => {
    switch (type) {
      case 'washroom':
        updateWashroomEntry(data);
        break;
      case 'food':
        updateFoodEntry(data);
        break;
      case 'sleep':
        updateSleepEntry(data);
        break;
      case 'weight':
        updateWeightEntry(data);
        break;
    }
  };

  const deleteEntry = async (type: keyof CatData, id: string) => {
    try {
      const res = await fetch(`${API_URL}/${type}/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        switch (type) {
          case 'washroom':
            setWashroomEntries(prev => prev.filter(entry => entry.id !== id));
            break;
          case 'food':
            setFoodEntries(prev => prev.filter(entry => entry.id !== id));
            break;
          case 'sleep':
            setSleepEntries(prev => prev.filter(entry => entry.id !== id));
            break;
          case 'weight':
            setWeightEntries(prev => prev.filter(entry => entry.id !== id));
            break;
          case 'photos':
            setPhotos(prev => prev.filter(photo => photo.id !== id));
            break;
        }
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const clearAllData = () => {
    // For now, just clear local state
    // In a real app, you might want to delete from backend too
    setCatProfileState(null);
    setWashroomEntries([]);
    setFoodEntries([]);
    setSleepEntries([]);
    setWeightEntries([]);
    setPhotos([]);
  };

  return (
    <CatDataContext.Provider
      value={{
        catProfile,
        washroomEntries,
        foodEntries,
        sleepEntries,
        weightEntries,
        photos,
        setCatProfile,
        addWashroomEntry,
        addFoodEntry,
        addSleepEntry,
        addWeightEntry,
        addPhoto,
        updateWashroomEntry,
        updateFoodEntry,
        updateSleepEntry,
        updateWeightEntry,
        updateEntry,
        deleteEntry,
        clearAllData
      }}
    >
      {children}
    </CatDataContext.Provider>
  );
};