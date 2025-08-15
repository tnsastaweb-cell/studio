
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { users, loading: usersLoading } = useUsers();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs once on mount to check for a logged-in user in localStorage.
    // This is a simple way to persist login state across page refreshes.
    if (!usersLoading) {
        setLoading(true);
        try {
            const storedUser = localStorage.getItem('sasta-user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // We should still verify this user against our "database"
                const foundUser = users.find(u => u.id === parsedUser.id);
                if (foundUser) {
                    setUser(foundUser);
                } else {
                    localStorage.removeItem('sasta-user');
                }
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('sasta-user');
        } finally {
            setLoading(false);
        }
    }
  }, [users, usersLoading]);

  const signIn = (employeeCode: string, password: string): boolean => {
    // This is the critical fix: ensure we are checking against the most up-to-date user list.
    const foundUser = users.find(
      (u) => u.employeeCode === employeeCode && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('sasta-user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('sasta-user');
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
