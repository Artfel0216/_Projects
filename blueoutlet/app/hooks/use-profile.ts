'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface UserData {
  name: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  avatar: string | null;
}

export interface AddressData {
  street: string;
  number: string;
  city: string;
  state: string;
  zip: string;
  complement: string;
}

interface ProfileState {
  user: UserData;
  address: AddressData;
}

const INITIAL_USER: UserData = {
  name: '',
  email: '',
  phone: '',
  role: '',
  bio: '',
  avatar: null,
};

const INITIAL_ADDRESS: AddressData = {
  street: '',
  number: '',
  city: '',
  state: '',
  zip: '',
  complement: '',
};

const STORAGE_KEY = '@app:profile-v1';

export function useProfile() {
  const [user, setUser] = useState<UserData>(INITIAL_USER);
  const [address, setAddress] = useState<AddressData>(INITIAL_ADDRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const updateStorage = useCallback((data: ProfileState) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Storage Error:', error);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const { user: cUser, address: cAddress } = JSON.parse(cached);
          setUser(prev => ({ ...prev, ...cUser }));
          setAddress(prev => ({ ...prev, ...cAddress }));
        }

        const response = await fetch('/api/user', { signal: controller.signal });
        
        if (!response.ok) throw new Error('Failed to fetch profile');

        const { user: sUser, address: sAddress } = await response.json();
        
        const freshData = {
          user: { ...INITIAL_USER, ...sUser },
          address: { ...INITIAL_ADDRESS, ...sAddress }
        };

        setUser(freshData.user);
        setAddress(freshData.address);
        updateStorage(freshData);

      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Profile Load Error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
    return () => controller.abort();
  }, [updateStorage]);

  const saveProfile = useCallback(async (newUser: UserData, newAddress: AddressData) => {
    setIsSaving(true);
    const payload: ProfileState = { user: newUser, address: newAddress };

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { message } = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(message || 'Failed to save profile');
      }

      setUser(newUser);
      setAddress(newAddress);
      updateStorage(payload);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    } finally {
      setIsSaving(false);
    }
  }, [updateStorage]);

  return useMemo(() => ({
    user,
    setUser,
    address,
    setAddress,
    isLoading,
    isSaving,
    saveProfile
  }), [user, address, isLoading, isSaving, saveProfile]);
}