import { useState, useEffect } from 'react';

interface UserData {
  name: string;
  email: string;
  phone: string;
  role: string;
  bio: string;
  avatar: string | null;
}

interface AddressData {
  street: string;
  number: string;
  city: string;
  state: string;
  zip: string;
  complement: string;
}

export function useProfile() {
  const [user, setUser] = useState<UserData>({
    name: "", email: "", phone: "", role: "", bio: "", avatar: null
  });
  const [address, setAddress] = useState<AddressData>({
    street: "", number: "", city: "", state: "", zip: "", complement: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const STORAGE_KEY = '@app:profile-data';

  useEffect(() => {
    async function loadData() {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setUser(parsed.user);
        setAddress(parsed.address);
      }

      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setAddress(data.address);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      } catch (error) {
        console.error("Erro ao sincronizar dados", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const saveProfile = async (newUser: UserData, newAddress: AddressData) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: newUser, address: newAddress }),
      });

      if (!res.ok) throw new Error("Erro no servidor");

      setUser(newUser);
      setAddress(newAddress);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: newUser, address: newAddress }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsSaving(false);
    }
  };

  return { user, setUser, address, setAddress, isLoading, isSaving, saveProfile };
}