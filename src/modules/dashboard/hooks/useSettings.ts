import { useState, useEffect, useCallback, useRef } from 'react';
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';
import { useAuth } from '@/app/api';
import { User, Client, Mechanic } from '@/app/api/types';

type ProfileData = {
  id?: number;
  name?: string;
  phone?: string;
  email?: string;
};

type UseSettingsOptions = {
  userRole?: 'manager' | 'client' | 'mechanic';
};

export function useSettings(options: UseSettingsOptions = {}) {
  const { userRole = 'manager' } = options;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData>({});
  const mechanicIdRef = useRef<number | undefined>(undefined);

  const getProfileEndpoint = useCallback(() => {
    if (userRole === 'manager') {
      return API_CONFIG.ENDPOINTS.USERS.PROFILE;
    } else if (userRole === 'client') {
      return API_CONFIG.ENDPOINTS.CLIENTS.PROFILE;
    } else {
      return API_CONFIG.ENDPOINTS.MECHANICS.PROFILE;
    }
  }, [userRole]);

  const getUpdateEndpoint = useCallback(() => {
    if (userRole === 'manager') {
      return API_CONFIG.ENDPOINTS.USERS.UPDATE;
    } else if (userRole === 'client') {
      return API_CONFIG.ENDPOINTS.CLIENTS.UPDATE;
    } else {
      return API_CONFIG.ENDPOINTS.MECHANICS.UPDATE;
    }
  }, [userRole]);

  const fetchProfile = useCallback(async () => {
    if (!user?.username) return;
    
    setLoading(true);
    try {
      // For mechanics, fetch by email since User ID and Mechanic ID are different
      if (userRole === 'mechanic') {
        const mechanicsRes = await httpClient.get<Mechanic[]>(API_CONFIG.ENDPOINTS.MECHANICS.LIST);
        if (mechanicsRes.data) {
          const currentMechanic = mechanicsRes.data.find(
            m => m.email?.toLowerCase() === user.username?.toLowerCase()
          );
          if (currentMechanic) {
            mechanicIdRef.current = currentMechanic.id;
            const profile: ProfileData = {
              id: currentMechanic.id,
              name: currentMechanic.name || '',
              phone: currentMechanic.phone || '',
              email: currentMechanic.email || '',
            };
            setProfileData(profile);
            setOriginalProfileData(profile);
          }
        }
      } else {
        const endpoint = getProfileEndpoint();
        const response = await httpClient.get<User | Client | Mechanic>(endpoint);
        
        if (response.data) {
          const data = response.data;
          const profile: ProfileData = {
            id: (data as any).id,
            name: (data as any).name || (data as User).email?.split('@')[0] || '',
            phone: (data as any).phone || '',
            email: (data as any).email || (data as User).email || '',
          };
          setProfileData(profile);
          setOriginalProfileData(profile);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.username, userRole, getProfileEndpoint]);

  const updateProfile = useCallback(async (data: ProfileData) => {
    if (!user?.username) return;

    setSaving(true);
    try {
      // For mechanics, use the mechanic ID (not the user ID)
      const id = userRole === 'mechanic' ? mechanicIdRef.current : user.userId;
      
      const updateData: any = {
        id: id,
        name: data.name,
        phone: data.phone,
        email: data.email,
      };

      const endpoint = getUpdateEndpoint();
      const response = await httpClient.put(endpoint, updateData);

      if (response.error) {
        throw new Error(response.error);
      }

      setOriginalProfileData(data);
      return response.data;
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [user?.username, user?.userId, userRole, getUpdateEndpoint]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profileData,
    setProfileData,
    originalProfileData,
    loading,
    saving,
    fetchProfile,
    updateProfile,
  };
}
