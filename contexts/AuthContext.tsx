import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_USERS } from '../constants/mockData';
import { Profile } from '../types';

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  login: (roll: string, password: string) => Promise<boolean>;
  logout: () => void;
  panelMode: 'student' | 'teacher';
  setPanelMode: (mode: 'student' | 'teacher') => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [panelMode, setPanelMode] = useState<'student' | 'teacher'>('student');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('et2324_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        if (parsed.role === 'teacher') setPanelMode('teacher');
        else setPanelMode('student');
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (roll: string, password: string): Promise<boolean> => {
    const found = MOCK_USERS.find(
      u => u.roll_number.trim().toLowerCase() === roll.trim().toLowerCase() && u.password === password
    );
    if (found) {
      setUser(found);
      await AsyncStorage.setItem('et2324_user', JSON.stringify(found));
      if (found.role === 'teacher') setPanelMode('teacher');
      else setPanelMode('student');
      return true;
    }
    return false;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('et2324_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, panelMode, setPanelMode }}>
      {children}
    </AuthContext.Provider>
  );
}
