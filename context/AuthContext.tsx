import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role, Patient } from '../types';
import { mockService } from '../services/mockService';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, role: Role) => Promise<boolean>;
  register: (user: Omit<Patient, 'id'>) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (identifier: string, role: Role): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const foundUser = await mockService.login(identifier, role);
      if (foundUser) {
        setUser(foundUser);
        return true;
      } else {
        setError('User not found. Please check credentials or register.');
        return false;
      }
    } catch (err) {
      setError('Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (newUser: Omit<Patient, 'id'>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const createdUser = await mockService.registerUser(newUser);
      setUser(createdUser);
      return true;
    } catch (err) {
      setError('Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};