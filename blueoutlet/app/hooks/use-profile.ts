'use client';

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
    name: "",
    email: "",
    phone: "",
    role: "",
    bio: "",
    avatar: null
  });

  const [address, setAddress] = useState<AddressData>({
    street: "",
    number: "",
    city: "",
    state: "",
    zip: "",
    complement: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const STORAGE_KEY = '@app:profile-data';

  useEffect(() => {
    async function loadData() {
      try {
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem(STORAGE_KEY);

          if (cached) {
            const parsed = JSON.parse(cached);
            setUser(parsed.user || {});
            setAddress(parsed.address || {});
          }
        }

        const res = await fetch('/api/user');

        if (res.ok) {
          const data = await res.json();

          setUser(data.user || {});
          setAddress(data.address || {});

          if (typeof window !== "undefined") {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                user: data.user,
                address: data.address
              })
            );
          }
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
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
        body: JSON.stringify({
          user: newUser,
          address: newAddress
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Erro no servidor");
      }

      // ✅ Atualiza estado
      setUser(newUser);
      setAddress(newAddress);

      // ✅ Atualiza cache
      if (typeof window !== "undefined") {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            user: newUser,
            address: newAddress
          })
        );
      }

      return { success: true };

    } catch (error: any) {
      console.error("Erro ao salvar:", error);

      return {
        success: false,
        error: error.message || "Erro desconhecido"
      };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    user,
    setUser,
    address,
    setAddress,
    isLoading,
    isSaving,
    saveProfile
  };
}