
import React, { createContext, useContext } from 'react';
import { User, UserRole } from '../types';

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    role: UserRole | null;
    isLoading: boolean;
}

export interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<string>;
    logout: () => void;
    signup: (fullName: string, email: string, password: string) => Promise<string>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
