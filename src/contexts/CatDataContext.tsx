import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ApiService } from '../services/api';
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
  isLoading: boolean;
  error: string | null;
  setCatProfile: (profile: CatProfile) => Promise<void>;
  addWashroomEntry: (entry: Omit<WashroomEntry, 'id' | 'catId' | 'createdAt'>) => Promise<void>;
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'catId' | 'createdAt'>) => Promise<void>;
  addSleepEntry: (entry: Omit<SleepEntry, 'id' | 'catId' | 'createdAt' | 'duration'>) => Promise<void>;
  addWeightEntry: (entry: Omit<WeightEntry, 'id' | 'catId' | 'createdAt'>) => Promise<void>;
  addPhoto: (photo: Omit<PhotoEntry, 'id' | 'catId' | 'createdAt'>) => Promise<void>;
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

export const CatDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [catProfile, setCatProfileState] = useState<CatProfile | null>(null);
  const [washroomEntries, setWashroomEntries] = useState<WashroomEntry[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to convert date strings to Date objects
  const parseDate = (dateString: string | Date | undefined): Date | undefined => {
    if (!dateString) return undefined;
    return typeof dateString === 'string' ? new Date(dateString) : dateString;
  };

  // Load all data from API on mount
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load profile first
      const profileData = await ApiService.profile.get();
      if (profileData) {
        const profile = {
          ...profileData,
          birthDate: parseDate(profileData.birthDate),
          gotchaDate: parseDate(profileData.gotchaDate),
          createdAt: parseDate(profileData.createdAt) || new Date(),
          updatedAt: parseDate(profileData.updatedAt) || new Date()
        };
        setCatProfileState(profile);

        // Load all entries for this cat
        const [washroomData, foodData, sleepData, weightData, photosData] = await Promise.all([
          ApiService.washroom.getAll(profile.id).catch(() => []),
          ApiService.food.getAll(profile.id).catch(() => []),
          ApiService.sleep.getAll(profile.id).catch(() => []),
          ApiService.weight.getAll(profile.id).catch(() => []),
          ApiService.photos.getAll(profile.id).catch(() => [])
        ]);

        // Parse dates for all entries
        setWashroomEntries(washroomData.map((entry: any) => ({
          ...entry,
          timestamp: parseDate(entry.timestamp) || new Date(),
          createdAt: parseDate(entry.createdAt) || new Date()
        })));

        setFoodEntries(foodData.map((entry: any) => ({
          ...entry,
          timestamp: parseDate(entry.timestamp) || new Date(),
          createdAt: parseDate(entry.createdAt) || new Date()
        })));

        setSleepEntries(sleepData.map((entry: any) => ({
          ...entry,
          startTime: parseDate(entry.startTime) || new Date(),
          endTime: parseDate(entry.endTime) || new Date(),
          createdAt: parseDate(entry.createdAt) || new Date()
        })));

        setWeightEntries(weightData.map((entry: any) => ({
          ...entry,
          measurementDate: parseDate(entry.measurementDate) || new Date(),
          createdAt: parseDate(entry.createdAt) || new Date()
        })));

        setPhotos(photosData.map((photo: any) => ({
          ...photo,
          uploadDate: parseDate(photo.uploadDate) || new Date(),
          createdAt: parseDate(photo.createdAt) || new Date()
        })));
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const setCatProfile = async (profile: CatProfile) => {
    try {
      let updatedProfile;
      if (catProfile?.id) {
        // Update existing profile
        updatedProfile = await ApiService.profile.update(catProfile.id, {
          ...profile,
          updatedAt: new Date()
        });
      } else {
        // Create new profile
        updatedProfile = await ApiService.profile.create({
          ...profile,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      setCatProfileState({
        ...updatedProfile,
        birthDate: parseDate(updatedProfile.birthDate),
        gotchaDate: parseDate(updatedProfile.gotchaDate),
        createdAt: parseDate(updatedProfile.createdAt) || new Date(),
        updatedAt: parseDate(updatedProfile.updatedAt) || new Date()
      });

      // If it's a new profile, reload all data
      if (!catProfile?.id) {
        await loadData();
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
      throw err;
    }
  };

  const addWashroomEntry = async (entry: Omit<WashroomEntry, 'id' | 'catId' | 'createdAt'>) => {
    if (!catProfile?.id) {
      setError('Please create a cat profile first');
      return;
    }

    try {
      const newEntry = await ApiService.washroom.create({
        ...entry,
        catId: catProfile.id,
        timestamp: entry.timestamp.toISOString()
      });
      
      setWashroomEntries(prev => [{
        ...newEntry,
        timestamp: parseDate(newEntry.timestamp) || new Date(),
        createdAt: parseDate(newEntry.createdAt) || new Date()
      }, ...prev]);
    } catch (err) {
      console.error('Error adding washroom entry:', err);
      setError('Failed to add washroom entry');
      throw err;
    }
  };

  const addFoodEntry = async (entry: Omit<FoodEntry, 'id' | 'catId' | 'createdAt'>) => {
    if (!catProfile?.id) {
      setError('Please create a cat profile first');
      return;
    }

    try {
      const newEntry = await ApiService.food.create({
        ...entry,
        catId: catProfile.id,
        timestamp: entry.timestamp.toISOString()
      });
      
      setFoodEntries(prev => [{
        ...newEntry,
        timestamp: parseDate(newEntry.timestamp) || new Date(),
        createdAt: parseDate(newEntry.createdAt) || new Date()
      }, ...prev]);
    } catch (err) {
      console.error('Error adding food entry:', err);
      setError('Failed to add food entry');
      throw err;
    }
  };

  const addSleepEntry = async (entry: Omit<SleepEntry, 'id' | 'catId' | 'createdAt' | 'duration'>) => {
    if (!catProfile?.id) {
      setError('Please create a cat profile first');
      return;
    }

    try {
      const duration = Math.floor((entry.endTime.getTime() - entry.startTime.getTime()) / 60000);
      const newEntry = await ApiService.sleep.create({
        ...entry,
        catId: catProfile.id,
        startTime: entry.startTime.toISOString(),
        endTime: entry.endTime.toISOString(),
        duration
      });
      
      setSleepEntries(prev => [{
        ...newEntry,
        startTime: parseDate(newEntry.startTime) || new Date(),
        endTime: parseDate(newEntry.endTime) || new Date(),
        createdAt: parseDate(newEntry.createdAt) || new Date()
      }, ...prev]);
    } catch (err) {
      console.error('Error adding sleep entry:', err);
      setError('Failed to add sleep entry');
      throw err;
    }
  };

  const addWeightEntry = async (entry: Omit<WeightEntry, 'id' | 'catId' | 'createdAt'>) => {
    if (!catProfile?.id) {
      setError('Please create a cat profile first');
      return;
    }

    try {
      const newEntry = await ApiService.weight.create({
        ...entry,
        catId: catProfile.id,
        measurementDate: entry.measurementDate.toISOString()
      });
      
      setWeightEntries(prev => [{
        ...newEntry,
        measurementDate: parseDate(newEntry.measurementDate) || new Date(),
        createdAt: parseDate(newEntry.createdAt) || new Date()
      }, ...prev]);
    } catch (err) {
      console.error('Error adding weight entry:', err);
      setError('Failed to add weight entry');
      throw err;
    }
  };

  const addPhoto = async (photo: Omit<PhotoEntry, 'id' | 'catId' | 'createdAt'>) => {
    if (!catProfile?.id) {
      setError('Please create a cat profile first');
      return;
    }

    try {
      const newPhoto = await ApiService.photos.create({
        ...photo,
        catId: catProfile.id,
        uploadDate: photo.uploadDate.toISOString()
      });
      
      setPhotos(prev => [{
        ...newPhoto,
        uploadDate: parseDate(newPhoto.uploadDate) || new Date(),
        createdAt: parseDate(newPhoto.createdAt) || new Date()
      }, ...prev]);
    } catch (err) {
      console.error('Error adding photo:', err);
      setError('Failed to add photo');
      throw err;
    }
  };

  const deleteEntry = async (type: keyof CatData, id: string) => {
    try {
      switch (type) {
        case 'washroom':
          await ApiService.washroom.delete(id);
          setWashroomEntries(prev => prev.filter(entry => entry.id !== id));
          break;
        case 'food':
          await ApiService.food.delete(id);
          setFoodEntries(prev => prev.filter(entry => entry.id !== id));
          break;
        case 'sleep':
          await ApiService.sleep.delete(id);
          setSleepEntries(prev => prev.filter(entry => entry.id !== id));
          break;
        case 'weight':
          await ApiService.weight.delete(id);
          setWeightEntries(prev => prev.filter(entry => entry.id !== id));
          break;
        case 'photos':
          await ApiService.photos.delete(id);
          setPhotos(prev => prev.filter(photo => photo.id !== id));
          break;
      }
    } catch (err) {
      console.error(`Error deleting ${type} entry:`, err);
      setError(`Failed to delete ${type} entry`);
      throw err;
    }
  };

  const clearAllData = () => {
    // This now just clears local state - actual deletion would need API endpoints
    setCatProfileState(null);
    setWashroomEntries([]);
    setFoodEntries([]);
    setSleepEntries([]);
    setWeightEntries([]);
    setPhotos([]);
  };

  const refreshData = async () => {
    await loadData();
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
        isLoading,
        error,
        setCatProfile,
        addWashroomEntry,
        addFoodEntry,
        addSleepEntry,
        addWeightEntry,
        addPhoto,
        deleteEntry,
        clearAllData,
        refreshData
      }}
    >
      {children}
    </CatDataContext.Provider>
  );
};