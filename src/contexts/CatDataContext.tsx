import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  deleteEntry: (type: keyof CatData, id: string) => void;
  clearAllData: () => void;
  isOnline: boolean;
  isSyncing: boolean;
}

const CatDataContext = createContext<CatDataContextType | undefined>(undefined);

export const useCatData = () => {
  const context = useContext(CatDataContext);
  if (!context) {
    throw new Error('useCatData must be used within a CatDataProvider');
  }
  return context;
};

const LOCAL_STORAGE_KEY = 'catTrackerData';
const API_URL = 'https://clever-generosity-production.up.railway.app/api';
const SYNC_INTERVAL = 5000; // Sync every 5 seconds when online

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (!obj) return obj;
  const converted: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    converted[camelKey] = obj[key];
  }
  return converted;
};

// Helper to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (!obj) return obj;
  const converted: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = obj[key];
  }
  return converted;
};

export const CatDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [catProfile, setCatProfile] = useState<CatProfile | null>(null);
  const [washroomEntries, setWashroomEntries] = useState<WashroomEntry[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<Date | null>(null);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('📡 Back online - syncing...');
      syncToCloud();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Offline - using local storage');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync to cloud
  const syncToCloud = async () => {
    if (!isOnline || isSyncing) return;
    
    try {
      setIsSyncing(true);
      
      // Data is already in state, just sync the profile for now

      if (catProfile) {
        // Check if profile exists
        const profileResponse = await fetch(`${API_URL}/profile`);
        const existingProfile = await profileResponse.json();

        const profileData = toSnakeCase({
          name: catProfile.name,
          breed: catProfile.breed,
          birthDate: catProfile.birthDate,
          gotchaDate: catProfile.gotchaDate,
          weight: catProfile.weight,
          photoUrl: catProfile.photoUrl
        });

        if (existingProfile && existingProfile.id) {
          // Update existing
          await fetch(`${API_URL}/profile/${existingProfile.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
          });
        } else {
          // Create new
          await fetch(`${API_URL}/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
          });
        }
        
        lastSyncRef.current = new Date();
        console.log('✅ Synced to cloud at', lastSyncRef.current.toLocaleTimeString());
      }
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Load from cloud on startup
  const loadFromCloud = async () => {
    if (!isOnline) return false;
    
    try {
      const response = await fetch(`${API_URL}/profile`);
      if (!response.ok) return false;
      
      const profile = await response.json();
      if (!profile) return false;

      // Convert and set profile
      const camelProfile = toCamelCase(profile);
      setCatProfile({
        ...camelProfile,
        birthDate: camelProfile.birthDate ? new Date(camelProfile.birthDate) : undefined,
        gotchaDate: camelProfile.gotchaDate ? new Date(camelProfile.gotchaDate) : undefined,
        createdAt: new Date(camelProfile.createdAt),
        updatedAt: new Date(camelProfile.updatedAt)
      });

      console.log('☁️ Loaded data from cloud');
      return true;
    } catch (error) {
      console.error('Failed to load from cloud:', error);
      return false;
    }
  };

  // Load data on mount - try cloud first, then localStorage
  useEffect(() => {
    const initData = async () => {
      // Try cloud first
      const cloudLoaded = await loadFromCloud();
      
      // If no cloud data, load from localStorage
      if (!cloudLoaded) {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            
            // Load profile
            if (parsedData.catProfile) {
              setCatProfile({
                ...parsedData.catProfile,
                birthDate: parsedData.catProfile.birthDate ? new Date(parsedData.catProfile.birthDate) : undefined,
                gotchaDate: parsedData.catProfile.gotchaDate ? new Date(parsedData.catProfile.gotchaDate) : undefined,
                createdAt: new Date(parsedData.catProfile.createdAt),
                updatedAt: new Date(parsedData.catProfile.updatedAt)
              });
            }
            
            // Load entries
            if (parsedData.washroomEntries) {
              setWashroomEntries(parsedData.washroomEntries.map((entry: any) => ({
                ...entry,
                timestamp: new Date(entry.timestamp),
                createdAt: new Date(entry.createdAt)
              })));
            }
            
            if (parsedData.foodEntries) {
              setFoodEntries(parsedData.foodEntries.map((entry: any) => ({
                ...entry,
                timestamp: new Date(entry.timestamp),
                createdAt: new Date(entry.createdAt)
              })));
            }
            
            if (parsedData.sleepEntries) {
              setSleepEntries(parsedData.sleepEntries.map((entry: any) => ({
                ...entry,
                startTime: new Date(entry.startTime),
                endTime: new Date(entry.endTime),
                createdAt: new Date(entry.createdAt)
              })));
            }
            
            if (parsedData.weightEntries) {
              setWeightEntries(parsedData.weightEntries.map((entry: any) => ({
                ...entry,
                measurementDate: new Date(entry.measurementDate),
                createdAt: new Date(entry.createdAt)
              })));
            }
            
            if (parsedData.photos) {
              setPhotos(parsedData.photos.map((photo: any) => ({
                ...photo,
                uploadDate: new Date(photo.uploadDate),
                createdAt: new Date(photo.createdAt)
              })));
            }
            
            console.log('💾 Loaded data from localStorage');
          } catch (error) {
            console.error('Error loading from localStorage:', error);
          }
        }
      }
    };
    
    initData();
  }, []);

  // Auto-save to localStorage and sync to cloud
  useEffect(() => {
    // Save to localStorage
    const dataToSave = {
      catProfile,
      washroomEntries,
      foodEntries,
      sleepEntries,
      weightEntries,
      photos
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    
    // Schedule cloud sync
    if (isOnline && catProfile) {
      // Clear previous timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      // Sync after 2 seconds of no changes
      syncTimeoutRef.current = setTimeout(() => {
        syncToCloud();
      }, 2000);
    }
  }, [catProfile, washroomEntries, foodEntries, sleepEntries, weightEntries, photos, isOnline]);

  // Set up periodic sync when online
  useEffect(() => {
    if (!isOnline) return;
    
    const interval = setInterval(() => {
      if (catProfile && !isSyncing) {
        syncToCloud();
      }
    }, SYNC_INTERVAL);
    
    return () => clearInterval(interval);
  }, [isOnline, catProfile, isSyncing]);

  const updateCatProfile = (profile: CatProfile) => {
    setCatProfile({
      ...profile,
      updatedAt: new Date()
    });
  };

  const addWashroomEntry = (entry: Omit<WashroomEntry, 'id' | 'catId' | 'createdAt'>) => {
    const newEntry: WashroomEntry = {
      ...entry,
      id: generateId(),
      catId: catProfile?.id || 'default',
      createdAt: new Date()
    };
    setWashroomEntries(prev => [newEntry, ...prev]);
  };

  const addFoodEntry = (entry: Omit<FoodEntry, 'id' | 'catId' | 'createdAt'>) => {
    const newEntry: FoodEntry = {
      ...entry,
      id: generateId(),
      catId: catProfile?.id || 'default',
      createdAt: new Date()
    };
    setFoodEntries(prev => [newEntry, ...prev]);
  };

  const addSleepEntry = (entry: Omit<SleepEntry, 'id' | 'catId' | 'createdAt' | 'duration'>) => {
    const newEntry: SleepEntry = {
      ...entry,
      id: generateId(),
      catId: catProfile?.id || 'default',
      duration: Math.floor((entry.endTime.getTime() - entry.startTime.getTime()) / 60000),
      createdAt: new Date()
    };
    setSleepEntries(prev => [newEntry, ...prev]);
  };

  const addWeightEntry = (entry: Omit<WeightEntry, 'id' | 'catId' | 'createdAt'>) => {
    const newEntry: WeightEntry = {
      ...entry,
      id: generateId(),
      catId: catProfile?.id || 'default',
      createdAt: new Date()
    };
    setWeightEntries(prev => [newEntry, ...prev]);
  };

  const addPhoto = (photo: Omit<PhotoEntry, 'id' | 'catId' | 'createdAt'>) => {
    const newPhoto: PhotoEntry = {
      ...photo,
      id: generateId(),
      catId: catProfile?.id || 'default',
      createdAt: new Date()
    };
    setPhotos(prev => [newPhoto, ...prev]);
  };

  const deleteEntry = (type: keyof CatData, id: string) => {
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
  };

  const clearAllData = () => {
    setCatProfile(null);
    setWashroomEntries([]);
    setFoodEntries([]);
    setSleepEntries([]);
    setWeightEntries([]);
    setPhotos([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
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
        setCatProfile: updateCatProfile,
        addWashroomEntry,
        addFoodEntry,
        addSleepEntry,
        addWeightEntry,
        addPhoto,
        deleteEntry,
        clearAllData,
        isOnline,
        isSyncing
      }}
    >
      {children}
    </CatDataContext.Provider>
  );
};