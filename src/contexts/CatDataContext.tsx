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

const LOCAL_STORAGE_KEY = 'catTrackerData';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const CatDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [catProfile, setCatProfile] = useState<CatProfile | null>(null);
  const [washroomEntries, setWashroomEntries] = useState<WashroomEntry[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // Convert date strings back to Date objects
        if (parsedData.catProfile) {
          setCatProfile({
            ...parsedData.catProfile,
            birthDate: parsedData.catProfile.birthDate ? new Date(parsedData.catProfile.birthDate) : undefined,
            createdAt: new Date(parsedData.catProfile.createdAt),
            updatedAt: new Date(parsedData.catProfile.updatedAt)
          });
        }
        
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
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      catProfile,
      washroomEntries,
      foodEntries,
      sleepEntries,
      weightEntries,
      photos
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [catProfile, washroomEntries, foodEntries, sleepEntries, weightEntries, photos]);

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
        clearAllData
      }}
    >
      {children}
    </CatDataContext.Provider>
  );
};