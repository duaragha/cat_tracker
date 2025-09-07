export interface CatProfile {
  id: string;
  name: string;
  breed?: string;
  birthDate?: Date;
  gotchaDate?: Date; // adoption/rescue date
  weight?: number; // stored in kg, displayed as lb
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WashroomEntry {
  id: string;
  catId: string;
  timestamp: Date;
  type: 'pee' | 'pooper' | 'both';
  consistency?: 'firm' | 'soft' | 'half n half' | 'diarrhea';
  hasBlood: boolean;
  color?: 'yellow' | 'green' | 'brown' | 'dark brown' | 'black' | 'other';
  photos?: string[]; // 2-3 photos max
  notes?: string;
  createdAt: Date;
}

export interface FoodEntry {
  id: string;
  catId: string;
  timestamp: Date;
  foodCategory: 'Dry' | 'Wet';
  foodType: string;
  brand?: string;
  amount: number;
  unit: 'grams' | 'cups' | 'pieces' | 'portions';
  portionToGrams?: number; // 1 portion = 10g default
  notes?: string;
  createdAt: Date;
}

export interface SleepEntry {
  id: string;
  catId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  quality?: 'restful' | 'normal' | 'restless';
  location: 'Cat Bed' | 'Bed' | 'Cat Tree' | 'Couch' | 'Floor' | 'Window' | 'Other';
  customLocation?: string; // if location is 'Other'
  notes?: string;
  photos?: string[];
  createdAt: Date;
}

export interface WeightEntry {
  id: string;
  catId: string;
  weight: number; // stored in kg, displayed as lb
  measurementDate: Date;
  photos?: string[]; // photos of cat and scale
  notes?: string;
  createdAt: Date;
}

export interface PhotoEntry {
  id: string;
  catId: string;
  imageUrl: string;
  uploadDate: Date;
  week: number;
  year: number;
  caption?: string;
  notes?: string;
  createdAt: Date;
}

export interface CatData {
  profile: CatProfile;
  washroom: WashroomEntry[];
  food: FoodEntry[];
  sleep: SleepEntry[];
  weight: WeightEntry[];
  photos: PhotoEntry[];
}

// Form data types
export interface WashroomFormData {
  timestamp: string;
  type: 'pee' | 'pooper' | 'both';
  consistency?: 'firm' | 'soft' | 'half n half' | 'diarrhea';
  hasBlood: boolean;
  color?: 'yellow' | 'green' | 'brown' | 'dark brown' | 'black' | 'other';
  photos?: string[];
  notes?: string;
}

export interface FoodFormData {
  timestamp: string;
  foodCategory: 'Dry' | 'Wet';
  foodType: string;
  brand?: string;
  amount: number;
  unit: 'grams' | 'cups' | 'pieces' | 'portions';
  portionToGrams?: number;
  notes?: string;
}

export interface SleepFormData {
  startTime: string;
  endTime: string;
  quality?: 'restful' | 'normal' | 'restless';
  location: 'Cat Bed' | 'Bed' | 'Cat Tree' | 'Couch' | 'Floor' | 'Window' | 'Other';
  customLocation?: string;
  notes?: string;
  photos?: string[];
}

export interface WeightFormData {
  weight: number;
  measurementDate: string;
  photos?: string[];
  notes?: string;
}

// Statistics types
export interface DailyStats {
  date: Date;
  washroomCount: number;
  totalFood: number;
  totalSleep: number;
  averageWeight?: number;
}

export interface WeeklyStats {
  week: number;
  year: number;
  averageWashroomPerDay: number;
  averageFoodPerDay: number;
  averageSleepPerDay: number;
  weightChange?: number;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  date: Date;
  category: 'washroom' | 'food' | 'sleep' | 'weight' | 'profile';
  title: string;
  description?: string;
  data: WashroomEntry | FoodEntry | SleepEntry | WeightEntry | ProfileEvent;
  color: string;
}

export interface ProfileEvent {
  id: string;
  catId: string;
  type: 'gotcha-day' | 'birthday' | 'vet-visit' | 'grooming' | 'other';
  date: Date;
  title: string;
  description?: string;
  isRecurring: boolean;
  createdAt: Date;
}

export type CalendarView = 'month' | 'week' | 'list';