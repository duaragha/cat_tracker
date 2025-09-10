import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type {
  WashroomEntry,
  FoodEntry,
  SleepEntry,
  WeightEntry,
} from '../types';

const CACHE_TIME = 1000 * 60 * 10; // 10 minutes
const STALE_TIME = 1000 * 60 * 2; // 2 minutes

// Query keys
export const queryKeys = {
  profile: ['profile'],
  washroom: (catId: string) => ['washroom', catId],
  food: (catId: string) => ['food', catId],
  sleep: (catId: string) => ['sleep', catId],
  weight: (catId: string) => ['weight', catId],
  photos: (catId: string) => ['photos', catId],
  all: (catId: string) => ['all-data', catId],
};

// Custom hooks for data fetching with caching
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: ApiService.profile.get,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useWashroomEntries = (catId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.washroom(catId!),
    queryFn: () => ApiService.washroom.getAll(catId!),
    enabled: !!catId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useFoodEntries = (catId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.food(catId!),
    queryFn: () => ApiService.food.getAll(catId!),
    enabled: !!catId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useSleepEntries = (catId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.sleep(catId!),
    queryFn: () => ApiService.sleep.getAll(catId!),
    enabled: !!catId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useWeightEntries = (catId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.weight(catId!),
    queryFn: () => ApiService.weight.getAll(catId!),
    enabled: !!catId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
};

export const usePhotos = (catId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.photos(catId!),
    queryFn: () => ApiService.photos.getAll(catId!),
    enabled: !!catId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
};

// Batch fetch all data (optimized)
export const useAllData = (catId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.all(catId!),
    queryFn: async () => {
      if (!catId) return null;
      
      // Parallel fetch all data
      const [washroom, food, sleep, weight, photos] = await Promise.all([
        ApiService.washroom.getAll(catId),
        ApiService.food.getAll(catId),
        ApiService.sleep.getAll(catId),
        ApiService.weight.getAll(catId),
        ApiService.photos.getAll(catId),
      ]);
      
      return { washroom, food, sleep, weight, photos };
    },
    enabled: !!catId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
};

// Mutations with optimistic updates
export const useAddWashroomEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiService.washroom.create,
    onMutate: async (newEntry) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.washroom(newEntry.catId) });
      
      // Snapshot previous value
      const previousEntries = queryClient.getQueryData(queryKeys.washroom(newEntry.catId));
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.washroom(newEntry.catId), (old: WashroomEntry[] = []) => {
        return [{ ...newEntry, id: 'temp-' + Date.now() }, ...old];
      });
      
      return { previousEntries };
    },
    onError: (_, newEntry, context) => {
      // Rollback on error
      if (context?.previousEntries) {
        queryClient.setQueryData(queryKeys.washroom(newEntry.catId), context.previousEntries);
      }
    },
    onSettled: (_, __, variables) => {
      // Refetch after success or error
      queryClient.invalidateQueries({ queryKey: queryKeys.washroom(variables.catId) });
    },
  });
};

export const useAddFoodEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiService.food.create,
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.food(newEntry.catId) });
      const previousEntries = queryClient.getQueryData(queryKeys.food(newEntry.catId));
      
      queryClient.setQueryData(queryKeys.food(newEntry.catId), (old: FoodEntry[] = []) => {
        return [{ ...newEntry, id: 'temp-' + Date.now() }, ...old];
      });
      
      return { previousEntries };
    },
    onError: (_, newEntry, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(queryKeys.food(newEntry.catId), context.previousEntries);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.food(variables.catId) });
    },
  });
};

export const useAddSleepEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiService.sleep.create,
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.sleep(newEntry.catId) });
      const previousEntries = queryClient.getQueryData(queryKeys.sleep(newEntry.catId));
      
      queryClient.setQueryData(queryKeys.sleep(newEntry.catId), (old: SleepEntry[] = []) => {
        return [{ ...newEntry, id: 'temp-' + Date.now() }, ...old];
      });
      
      return { previousEntries };
    },
    onError: (_, newEntry, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(queryKeys.sleep(newEntry.catId), context.previousEntries);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sleep(variables.catId) });
    },
  });
};

export const useAddWeightEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ApiService.weight.create,
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.weight(newEntry.catId) });
      const previousEntries = queryClient.getQueryData(queryKeys.weight(newEntry.catId));
      
      queryClient.setQueryData(queryKeys.weight(newEntry.catId), (old: WeightEntry[] = []) => {
        return [{ ...newEntry, id: 'temp-' + Date.now() }, ...old];
      });
      
      return { previousEntries };
    },
    onError: (_, newEntry, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(queryKeys.weight(newEntry.catId), context.previousEntries);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weight(variables.catId) });
    },
  });
};

// Prefetch data for faster navigation
export const usePrefetchData = () => {
  const queryClient = useQueryClient();
  
  const prefetchAll = async (catId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.washroom(catId),
        queryFn: () => ApiService.washroom.getAll(catId),
        staleTime: STALE_TIME,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.food(catId),
        queryFn: () => ApiService.food.getAll(catId),
        staleTime: STALE_TIME,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.sleep(catId),
        queryFn: () => ApiService.sleep.getAll(catId),
        staleTime: STALE_TIME,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.weight(catId),
        queryFn: () => ApiService.weight.getAll(catId),
        staleTime: STALE_TIME,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.photos(catId),
        queryFn: () => ApiService.photos.getAll(catId),
        staleTime: STALE_TIME,
      }),
    ]);
  };
  
  return { prefetchAll };
};