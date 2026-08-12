import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getProfile } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: { id: number; nama_role: string; kode_role: string };
  nomor_anggota?: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('authToken');
      if (storedToken) {
        setToken(storedToken);
        const response = await getProfile();
        setUser(response.data);
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (newToken: string) => {
    await SecureStore.setItemAsync('authToken', newToken);
    setToken(newToken);
    const response = await getProfile();
    setUser(response.data);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('authToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
