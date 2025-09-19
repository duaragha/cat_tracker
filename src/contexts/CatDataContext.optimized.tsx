import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
  CatProfile,
  WashroomEntry,
  FoodEntry,
  SleepEntry,
  WeightEntry,
  PhotoEntry,
  TreatEntry,
  CatData
} from '../types';

interface CatDataContextType {
  catProfile: CatProfile | null;
  washroomEntries: WashroomEntry[];
  foodEntries: FoodEntry[];
  sleepEntries: SleepEntry[];
  weightEntries: WeightEntry[];
  photos: PhotoEntry[];
  treatEntries: TreatEntry[];
  isLoading: boolean;
  error: string | null;
  setCatProfile: (profile: CatProfile) => Promise<void>;
  addWashroomEntry: (entry: Omit<WashroomEntry, 'id' | 'catId' | 'createdAt'>) => Promise<void>;
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'catId' | 'createdAt'>) => Promise<void>;
  addSleepEntry: (entry: Omit<SleepEntry, 'id' | 'catId' | 'createdAt' | 'duration'>) => Promise<void>;
  addWeightEntry: (entry: Omit<WeightEntry, 'id' | 'catId' | 'createdAt'>) => Promise<void>;
  addPhoto: (photo: Omit<PhotoEntry, 'id' | 'catId' | 'createdAt'>) => Promise<void>;
  addTreatEntry: (entry: Omit<TreatEntry, 'id' | 'catId' | 'createdAt'>) => Promise<void>;
  updateEntry: (type: keyof CatData, id: string, data: any) => Promise<void>;
  deleteEntry: (type: keyof CatData, id: string) => Promise<void>;
  clearAllData: () => void;
  refreshData: () => Promise<void>;
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

// Request deduplication cache
const requestCache = new Map<string, Promise<any>>();

// Optimized fetch function with caching and error handling
const fetchWithCache = async (url: string, options?: RequestInit): Promise<any> => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // Return cached promise if it exists and is fresh (5 seconds)
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }
  
  const request = fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }).finally(() => {
    // Remove from cache after 5 seconds
    setTimeout(() => {
      requestCache.delete(cacheKey);
    }, 5000);
  });
  
  requestCache.set(cacheKey, request);
  return request;
};

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

// Optimized state updaters using immer pattern (without immer dependency)
const optimizedArrayUpdate = <T extends { id: string }>(
  array: T[], 
  newItem: T, 
  operation: 'add' | 'update' | 'delete'
): T[] => {
  switch (operation) {
    case 'add':
      return [newItem, ...array];
    case 'update':
      return array.map(item => item.id === newItem.id ? newItem : item);
    case 'delete':
      return array.filter(item => item.id !== newItem.id);
    default:
      return array;
  }
};

export const CatDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [catProfile, setCatProfileState] = useState<CatProfile | null>(null);
  const [washroomEntries, setWashroomEntries] = useState<WashroomEntry[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [treatEntries, setTreatEntries] = useState<TreatEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optimized error handler
  const handleError = useCallback((error: any, operation?: string) => {
    console.error(`Error ${operation}:`, error);
    setError(error.message || 'An unexpected error occurred');
    setIsLoading(false);
  }, []);

  // Load profile with error handling
  const loadProfile = useCallback(async () => {
    try {
      const data = await fetchWithCache(`${API_URL}/profile`);
      if (data) {
        const profile = toCamelCase(data);
        profile.birthDate = data.birth_date ? new Date(data.birth_date) : undefined;
        profile.gotchaDate = data.gotcha_date ? new Date(data.gotcha_date) : undefined;
        profile.createdAt = new Date(data.created_at);
        profile.updatedAt = new Date(data.updated_at);
        setCatProfileState(profile);
        return profile;
      }
      return null;
    } catch (error) {
      handleError(error, 'loading profile');
      return null;
    }
  }, [handleError]);

  // Optimized data loading with parallel requests and better error handling
  const loadAllData = useCallback(async (catId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load all data types in parallel with individual error handling
      const [washroom, food, sleep, weight, photoData, treats] = await Promise.allSettled([
        fetchWithCache(`${API_URL}/washroom/${catId}`),
        fetchWithCache(`${API_URL}/food/${catId}`),
        fetchWithCache(`${API_URL}/sleep/${catId}`),
        fetchWithCache(`${API_URL}/weight/${catId}`),
        fetchWithCache(`${API_URL}/photos/${catId}`),
        fetchWithCache(`${API_URL}/treats/${catId}`)
      ]);

      // Process washroom entries with error handling
      if (washroom.status === 'fulfilled') {
        const processedWashroom = washroom.value.map((e: any) => {
          const entry = toCamelCase(e);
          entry.timestamp = new Date(e.timestamp);
          entry.createdAt = new Date(e.created_at);
          entry.hasBlood = e.has_blood;
          return entry;
        });
        setWashroomEntries(processedWashroom);
      }

      // Process food entries with error handling
      if (food.status === 'fulfilled') {
        const processedFood = food.value.map((e: any) => {
          const entry = toCamelCase(e);
          entry.timestamp = new Date(e.timestamp);
          entry.createdAt = new Date(e.created_at);
          return entry;
        });
        setFoodEntries(processedFood);
      }

      // Process sleep entries with error handling
      if (sleep.status === 'fulfilled') {
        const processedSleep = sleep.value.map((e: any) => {
          const entry = toCamelCase(e);
          entry.startTime = new Date(e.start_time);
          entry.endTime = new Date(e.end_time);
          entry.createdAt = new Date(e.created_at);
          return entry;
        });
        setSleepEntries(processedSleep);
      }

      // Process weight entries with error handling
      if (weight.status === 'fulfilled') {
        const processedWeight = weight.value.map((e: any) => {
          const entry = toCamelCase(e);
          const [year, month, day] = e.measurement_date.split('T')[0].split('-').map(Number);
          entry.measurementDate = new Date(year, month - 1, day, 12, 0, 0);
          entry.createdAt = new Date(e.created_at);
          return entry;
        });
        setWeightEntries(processedWeight);
      }

      // Process photos with error handling
      if (photoData.status === 'fulfilled') {
        const processedPhotos = photoData.value.map((e: any) => {
          const entry = toCamelCase(e);
          entry.uploadDate = new Date(e.upload_date);
          entry.createdAt = new Date(e.created_at);
          return entry;
        });
        setPhotos(processedPhotos);
      }

      // Process treat entries with error handling
      if (treats.status === 'fulfilled') {
        const processedTreats = treats.value.map((e: any) => {
          const entry = toCamelCase(e);
          entry.timestamp = new Date(e.timestamp);
          entry.createdAt = new Date(e.created_at);
          return entry;
        });
        setTreatEntries(processedTreats);
      }

    } catch (error) {
      handleError(error, 'loading data');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Load all data when profile changes
  useEffect(() => {
    if (catProfile?.id) {
      loadAllData(catProfile.id);
    }
  }, [catProfile?.id, loadAllData]);

  // Optimized profile setter
  const setCatProfile = useCallback(async (profile: CatProfile) => {
    setIsLoading(true);
    setError(null);
    
    try {
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
      
      const data = await fetchWithCache(`${API_URL}/profile`, {
        method: 'POST',
        body: JSON.stringify(profileData)
      });
      
      const newProfile = toCamelCase(data);
      newProfile.birthDate = data.birth_date ? new Date(data.birth_date) : undefined;
      newProfile.gotchaDate = data.gotcha_date ? new Date(data.gotcha_date) : undefined;
      newProfile.createdAt = new Date(data.created_at);
      newProfile.updatedAt = new Date(data.updated_at);
      setCatProfileState(newProfile);
    } catch (error) {
      handleError(error, 'saving profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Optimized entry addition with optimistic updates
  const addWashroomEntry = useCallback(async (entry: Omit<WashroomEntry, 'id' | 'catId' | 'createdAt'>) => {
    if (!catProfile?.id) throw new Error('No cat profile available');
    
    // Optimistic update
    const optimisticEntry = {
      id: `temp-${Date.now()}`,
      catId: catProfile.id,
      createdAt: new Date(),
      ...entry
    } as WashroomEntry;
    
    setWashroomEntries(prev => optimizedArrayUpdate(prev, optimisticEntry, 'add'));
    
    try {
      const data = await fetchWithCache(`${API_URL}/washroom`, {
        method: 'POST',
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
      
      const newEntry = toCamelCase(data);
      newEntry.timestamp = new Date(data.timestamp);
      newEntry.createdAt = new Date(data.created_at);
      newEntry.hasBlood = data.has_blood;
      
      // Replace optimistic entry with real entry
      setWashroomEntries(prev => prev.map(e => e.id === optimisticEntry.id ? newEntry : e));
    } catch (error) {
      // Rollback optimistic update
      setWashroomEntries(prev => optimizedArrayUpdate(prev, optimisticEntry, 'delete'));
      handleError(error, 'adding washroom entry');
      throw error;
    }
  }, [catProfile?.id, handleError]);

  // Similar optimizations for other add methods...
  const addFoodEntry = useCallback(async (entry: Omit<FoodEntry, 'id' | 'catId' | 'createdAt'>) => {
    if (!catProfile?.id) throw new Error('No cat profile available');
    
    const optimisticEntry = {
      id: `temp-${Date.now()}`,
      catId: catProfile.id,
      createdAt: new Date(),
      ...entry
    } as FoodEntry;
    
    setFoodEntries(prev => optimizedArrayUpdate(prev, optimisticEntry, 'add'));
    
    try {
      const data = await fetchWithCache(`${API_URL}/food`, {
        method: 'POST',
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
      
      const newEntry = toCamelCase(data);
      newEntry.timestamp = new Date(data.timestamp);
      newEntry.createdAt = new Date(data.created_at);
      
      setFoodEntries(prev => prev.map(e => e.id === optimisticEntry.id ? newEntry : e));
    } catch (error) {
      setFoodEntries(prev => optimizedArrayUpdate(prev, optimisticEntry, 'delete'));
      handleError(error, 'adding food entry');
      throw error;
    }
  }, [catProfile?.id, handleError]);

  const addSleepEntry = useCallback(async (entry: Omit<SleepEntry, 'id' | 'catId' | 'createdAt' | 'duration'>) => {
    if (!catProfile?.id) throw new Error('No cat profile available');
    
    const duration = Math.round((entry.endTime.getTime() - entry.startTime.getTime()) / 60000);
    const optimisticEntry = {
      id: `temp-${Date.now()}`,
      catId: catProfile.id,
      createdAt: new Date(),
      duration,
      ...entry
    } as SleepEntry;
    
    setSleepEntries(prev => optimizedArrayUpdate(prev, optimisticEntry, 'add'));
    
    try {
      const data = await fetchWithCache(`${API_URL}/sleep`, {
        method: 'POST',
        body: JSON.stringify({
          catId: catProfile.id,
          startTime: entry.startTime.toISOString(),
          endTime: entry.endTime.toISOString(),
          quality: entry.quality,
          location: entry.location,
          customLocation: entry.customLocation,
          photos: entry.photos || [],
          notes: entry.notes
        })
      });
      
      const newEntry = toCamelCase(data);
      newEntry.startTime = new Date(data.start_time);
      newEntry.endTime = new Date(data.end_time);
      newEntry.createdAt = new Date(data.created_at);
      
      setSleepEntries(prev => prev.map(e => e.id === optimisticEntry.id ? newEntry : e));
    } catch (error) {
      setSleepEntries(prev => optimizedArrayUpdate(prev, optimisticEntry, 'delete'));
      handleError(error, 'adding sleep entry');
      throw error;
    }
  }, [catProfile?.id, handleError]);

  const addWeightEntry = useCallback(async (entry: Omit<WeightEntry, 'id' | 'catId' | 'createdAt'>) => {
    if (!catProfile?.id) throw new Error('No cat profile available');
    
    const optimisticEntry = {
      id: `temp-${Date.now()}`,
      catId: catProfile.id,
      createdAt: new Date(),
      ...entry
    } as WeightEntry;
    
    setWeightEntries(prev => optimizedArrayUpdate(prev, optimisticEntry, 'add'));
    
    try {
      const localDate = entry.measurementDate;
      const dateStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
      
      const data = await fetchWithCache(`${API_URL}/weight`, {
        method: 'POST',
        body: JSON.stringify({
          ...toSnakeCase(entry),
          catId: catProfile.id,
          measurement_date: dateStr
        })
      });
      
      const newEntry = toCamelCase(data);
      const [year, month, day] = data.measurement_date.split('T')[0].split('-').map(Number);
      newEntry.measurementDate = new Date(year, month - 1, day, 12, 0, 0);
      newEntry.createdAt = new Date(data.created_at);
      
      setWeightEntries(prev => prev.map(e => e.id === optimisticEntry.id ? newEntry : e));
    } catch (error) {
      setWeightEntries(prev => optimizedArrayUpdate(prev, optimisticEntry, 'delete'));
      handleError(error, 'adding weight entry');
      throw error;
    }
  }, [catProfile?.id, handleError]);

  const addPhoto = useCallback(async (photo: Omit<PhotoEntry, 'id' | 'catId' | 'createdAt'>) => {
    if (!catProfile?.id) throw new Error('No cat profile available');
    
    const optimisticPhoto = {
      id: `temp-${Date.now()}`,
      catId: catProfile.id,
      createdAt: new Date(),
      ...photo
    } as PhotoEntry;
    
    setPhotos(prev => optimizedArrayUpdate(prev, optimisticPhoto, 'add'));
    
    try {
      const data = await fetchWithCache(`${API_URL}/photos`, {
        method: 'POST',
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
      
      const newPhoto = toCamelCase(data);
      newPhoto.uploadDate = new Date(data.upload_date);
      newPhoto.createdAt = new Date(data.created_at);
      
      setPhotos(prev => prev.map(p => p.id === optimisticPhoto.id ? newPhoto : p));
    } catch (error) {
      setPhotos(prev => optimizedArrayUpdate(prev, optimisticPhoto, 'delete'));
      handleError(error, 'adding photo');
      throw error;
    }
  }, [catProfile?.id, handleError]);

  const addTreatEntry = useCallback(async (entry: Omit<TreatEntry, 'id' | 'catId' | 'createdAt'>) => {
    if (!catProfile?.id) throw new Error('No cat profile available');

    const optimisticEntry = {
      id: `temp-${Date.now()}`,
      catId: catProfile.id,
      createdAt: new Date(),
      ...entry
    } as TreatEntry;

    setTreatEntries(prev => optimizedArrayUpdate(prev, optimisticEntry, 'add'));

    try {
      const data = await fetchWithCache(`${API_URL}/treats`, {
        method: 'POST',
        body: JSON.stringify({
          catId: catProfile.id,
          timestamp: entry.timestamp.toISOString(),
          treatType: entry.treatType,
          brand: entry.brand,
          quantity: entry.quantity,
          calories: entry.calories,
          purpose: entry.purpose,
          notes: entry.notes
        })
      });

      const newEntry = toCamelCase(data);
      newEntry.timestamp = new Date(data.timestamp);
      newEntry.createdAt = new Date(data.created_at);

      setTreatEntries(prev => prev.map(e => e.id === optimisticEntry.id ? newEntry : e));
    } catch (error) {
      setTreatEntries(prev => optimizedArrayUpdate(prev, optimisticEntry, 'delete'));
      handleError(error, 'adding treat entry');
      throw error;
    }
  }, [catProfile?.id, handleError]);

  // Unified update method
  const updateEntry = useCallback(async (type: keyof CatData, id: string, data: any) => {
    setError(null);
    
    try {
      let apiEndpoint = '';
      let processedData = {};
      let updateState: (updater: (prev: any[]) => any[]) => void = () => {};

      switch (type) {
        case 'washroom':
          apiEndpoint = `${API_URL}/washroom/${id}`;
          processedData = {
            ...toSnakeCase(data),
            timestamp: data.timestamp.toISOString()
          };
          updateState = setWashroomEntries;
          break;
        case 'food':
          apiEndpoint = `${API_URL}/food/${id}`;
          processedData = {
            ...toSnakeCase(data),
            timestamp: data.timestamp.toISOString()
          };
          updateState = setFoodEntries;
          break;
        case 'sleep':
          apiEndpoint = `${API_URL}/sleep/${id}`;
          processedData = {
            ...toSnakeCase(data),
            startTime: data.startTime.toISOString(),
            endTime: data.endTime.toISOString()
          };
          updateState = setSleepEntries;
          break;
        case 'weight':
          const localDate = data.measurementDate;
          const dateStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
          apiEndpoint = `${API_URL}/weight/${id}`;
          processedData = {
            ...toSnakeCase(data),
            measurement_date: dateStr
          };
          updateState = setWeightEntries;
          break;
        case 'treats':
          apiEndpoint = `${API_URL}/treats/${id}`;
          processedData = {
            ...toSnakeCase(data),
            timestamp: data.timestamp.toISOString()
          };
          updateState = setTreatEntries;
          break;
        default:
          throw new Error(`Update not implemented for type: ${type}`);
      }

      const response = await fetchWithCache(apiEndpoint, {
        method: 'PUT',
        body: JSON.stringify(processedData)
      });
      
      // Process the updated entry based on type
      let updatedEntry = toCamelCase(response);
      
      switch (type) {
        case 'washroom':
          updatedEntry.timestamp = new Date(response.timestamp);
          updatedEntry.createdAt = new Date(response.created_at);
          updatedEntry.hasBlood = response.has_blood;
          break;
        case 'food':
          updatedEntry.timestamp = new Date(response.timestamp);
          updatedEntry.createdAt = new Date(response.created_at);
          break;
        case 'sleep':
          updatedEntry.startTime = new Date(response.start_time);
          updatedEntry.endTime = new Date(response.end_time);
          updatedEntry.createdAt = new Date(response.created_at);
          break;
        case 'weight':
          const [year, month, day] = response.measurement_date.split('T')[0].split('-').map(Number);
          updatedEntry.measurementDate = new Date(year, month - 1, day, 12, 0, 0);
          updatedEntry.createdAt = new Date(response.created_at);
          break;
        case 'treats':
          updatedEntry.timestamp = new Date(response.timestamp);
          updatedEntry.createdAt = new Date(response.created_at);
          break;
      }
      
      updateState((prev: any[]) => prev.map((entry: any) => entry.id === id ? updatedEntry : entry));
    } catch (error) {
      handleError(error, `updating ${type} entry`);
      throw error;
    }
  }, [handleError]);

  // Optimized delete method
  const deleteEntry = useCallback(async (type: keyof CatData, id: string) => {
    setError(null);
    
    try {
      await fetchWithCache(`${API_URL}/${type}/${id}`, {
        method: 'DELETE'
      });
      
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
        case 'treats':
          setTreatEntries(prev => prev.filter(entry => entry.id !== id));
          break;
      }
    } catch (error) {
      handleError(error, `deleting ${type} entry`);
      throw error;
    }
  }, [handleError]);

  const clearAllData = useCallback(() => {
    setCatProfileState(null);
    setWashroomEntries([]);
    setFoodEntries([]);
    setSleepEntries([]);
    setWeightEntries([]);
    setPhotos([]);
    setTreatEntries([]);
    setError(null);
  }, []);

  const refreshData = useCallback(async () => {
    if (catProfile?.id) {
      await loadAllData(catProfile.id);
    } else {
      await loadProfile();
    }
  }, [catProfile?.id, loadAllData, loadProfile]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    catProfile,
    washroomEntries,
    foodEntries,
    sleepEntries,
    weightEntries,
    photos,
    treatEntries,
    isLoading,
    error,
    setCatProfile,
    addWashroomEntry,
    addFoodEntry,
    addSleepEntry,
    addWeightEntry,
    addPhoto,
    addTreatEntry,
    updateEntry,
    deleteEntry,
    clearAllData,
    refreshData
  }), [
    catProfile,
    washroomEntries,
    foodEntries,
    sleepEntries,
    weightEntries,
    photos,
    treatEntries,
    isLoading,
    error,
    setCatProfile,
    addWashroomEntry,
    addFoodEntry,
    addSleepEntry,
    addWeightEntry,
    addPhoto,
    addTreatEntry,
    updateEntry,
    deleteEntry,
    clearAllData,
    refreshData
  ]);

  return (
    <CatDataContext.Provider value={contextValue}>
      {children}
    </CatDataContext.Provider>
  );
};