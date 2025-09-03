// Sync service to handle data synchronization between localStorage and backend
const API_URL = 'https://clever-generosity-production.up.railway.app/api';

interface SyncStatus {
  isSyncing: boolean;
  lastSync: Date | null;
  error: string | null;
}

class SyncService {
  private status: SyncStatus = {
    isSyncing: false,
    lastSync: null,
    error: null
  };

  // Helper to convert snake_case from DB to camelCase for frontend
  private toCamelCase(obj: any): any {
    if (!obj) return obj;
    
    const converted: any = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      converted[camelKey] = obj[key];
    }
    return converted;
  }

  // Helper to convert camelCase from frontend to snake_case for DB
  private toSnakeCase(obj: any): any {
    if (!obj) return obj;
    
    const converted: any = {};
    for (const key in obj) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      converted[snakeKey] = obj[key];
    }
    return converted;
  }

  // Push local data to backend
  async pushToBackend(localData: any): Promise<boolean> {
    try {
      this.status.isSyncing = true;
      this.status.error = null;

      // Check if profile exists
      const profileResponse = await fetch(`${API_URL}/profile`);
      const existingProfile = await profileResponse.json();

      if (localData.catProfile) {
        const profileData = this.toSnakeCase({
          name: localData.catProfile.name,
          breed: localData.catProfile.breed,
          birthDate: localData.catProfile.birthDate,
          gotchaDate: localData.catProfile.gotchaDate,
          weight: localData.catProfile.weight,
          photoUrl: localData.catProfile.photoUrl
        });

        if (existingProfile && existingProfile.id) {
          // Update existing profile
          await fetch(`${API_URL}/profile/${existingProfile.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
          });
        } else {
          // Create new profile
          await fetch(`${API_URL}/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
          });
        }

        // Now sync all entries (we'll add these endpoints to backend later)
        // For now, just mark as synced
        this.status.lastSync = new Date();
        localStorage.setItem('lastSyncTime', this.status.lastSync.toISOString());
      }

      this.status.isSyncing = false;
      return true;
    } catch (error) {
      console.error('Sync push error:', error);
      this.status.error = error instanceof Error ? error.message : 'Push failed';
      this.status.isSyncing = false;
      return false;
    }
  }

  // Pull data from backend to local
  async pullFromBackend(): Promise<any | null> {
    try {
      this.status.isSyncing = true;
      this.status.error = null;

      // Get profile
      const profileResponse = await fetch(`${API_URL}/profile`);
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profile = await profileResponse.json();

      if (!profile) {
        this.status.isSyncing = false;
        return null;
      }

      // Convert to camelCase for frontend
      const camelProfile = this.toCamelCase(profile);

      // Get all entries for this profile (we'll add these endpoints later)
      const data = {
        catProfile: {
          ...camelProfile,
          birthDate: camelProfile.birthDate ? new Date(camelProfile.birthDate) : undefined,
          gotchaDate: camelProfile.gotchaDate ? new Date(camelProfile.gotchaDate) : undefined,
          createdAt: new Date(camelProfile.createdAt),
          updatedAt: new Date(camelProfile.updatedAt)
        },
        washroomEntries: [],
        foodEntries: [],
        sleepEntries: [],
        weightEntries: [],
        photos: []
      };

      this.status.lastSync = new Date();
      this.status.isSyncing = false;
      localStorage.setItem('lastSyncTime', this.status.lastSync.toISOString());

      return data;
    } catch (error) {
      console.error('Sync pull error:', error);
      this.status.error = error instanceof Error ? error.message : 'Pull failed';
      this.status.isSyncing = false;
      return null;
    }
  }

  // Check if backend is available
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        mode: 'cors'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getStatus(): SyncStatus {
    return { ...this.status };
  }
}

export const syncService = new SyncService();