
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUsers, User } from '@/services/users';

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  signIn: (employeeCode: string, password: string) => boolean;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sasta-user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { users, loading: usersLoading } = useUsers();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromStorage = () => {
     try {
        const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedUser) {
            const parsedUser: User = JSON.parse(storedUser);
            // Validate the stored user against the current user list from useUsers
            const foundUser = users.find(u => u.id === parsedUser.id && u.password === parsedUser.password);
            setUser(foundUser || null);
        } else {
          setUser(null);
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        setUser(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    // This effect runs once on mount to check for a logged-in user in localStorage.
    if (!usersLoading) {
        setLoading(true);
        loadUserFromStorage();
    }
  }, [usersLoading, users]); // Add `users` as a dependency to re-validate when it changes

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_KEY) {
         loadUserFromStorage();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [users]); // Depend on users to ensure the handler has the latest user list

  const signIn = (employeeCode: string, password: string): boolean => {
    const foundUser = users.find(
      (u) => u.employeeCode === employeeCode && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    // Dispatch a storage event to notify other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: LOCAL_STORAGE_KEY, newValue: null }));
  };

  const isLoading = usersLoading || loading;

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, signIn, signOut, loading: isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
