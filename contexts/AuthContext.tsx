import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
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
      } else {
        // Fallback: check supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profile) {
            setUser(profile);
            if (profile.role === 'teacher') setPanelMode('teacher');
            else setPanelMode('student');
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (roll: string, password: string): Promise<boolean> => {
    try {
      const email = `${roll.trim().toLowerCase()}@fpi.edu`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error || !data.user) {
        console.error('Login failed:', error?.message);
        return false;
      }
      
      const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      
      if (profile) {
        setUser(profile as Profile);
        await AsyncStorage.setItem('et2324_user', JSON.stringify(profile));
        if (profile.role === 'teacher') setPanelMode('teacher');
        else setPanelMode('student');
        return true;
      }
    } catch (e) {
      console.error('Login exception:', e);
    }
    return false;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('et2324_user');
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, panelMode, setPanelMode }}>
      {children}
    </AuthContext.Provider>
  );
}
