
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

// Define theme structures
export interface Theme {
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        success: string;
        danger: string;
        background: string;
        card: string;
        textPrimary: string;
        textSecondary: string;
        border: string;
        shadowPrimary: string;
        shadowSecondary: string;
    };
}

// Create theme definitions
export const themes: { [key: string]: Theme } = {
    'black-white': {
        name: 'Simple Black & White',
        colors: {
            primary: '#FFFFFF',
            secondary: '#A0A0A0',
            accent: '#FFFFFF',
            success: '#FFFFFF',
            danger: '#FFFFFF',
            background: '#000000',
            card: 'rgba(255, 255, 255, 0.08)',
            textPrimary: '#FFFFFF',
            textSecondary: '#A0A0A0',
            border: 'rgba(255, 255, 255, 0.15)',
            shadowPrimary: '0 0 15px rgba(255, 255, 255, 0.6), 0 0 5px rgba(255, 255, 255, 0.8)',
            shadowSecondary: '0 0 15px rgba(160, 160, 160, 0.6), 0 0 5px rgba(160, 160, 160, 0.8)',
        },
    },
    'neon-blue': {
        name: 'Neon Blue',
        colors: {
            primary: '#2979FF',
            secondary: '#673AB7',
            accent: '#FF9800',
            success: '#4CAF50',
            danger: '#F44336',
            background: '#0D0C22',
            card: 'rgba(255, 255, 255, 0.05)',
            textPrimary: '#FFFFFF',
            textSecondary: '#9CA3AF',
            border: 'rgba(255, 255, 255, 0.1)',
            shadowPrimary: '0 0 15px rgba(41, 121, 255, 0.6), 0 0 5px rgba(41, 121, 255, 0.8)',
            shadowSecondary: '0 0 15px rgba(103, 58, 183, 0.6), 0 0 5px rgba(103, 58, 183, 0.8)',
        },
    },
    'deep-purple': {
        name: 'Deep Purple',
        colors: {
            primary: '#8E24AA',
            secondary: '#D81B60',
            accent: '#00ACC1',
            success: '#689F38',
            danger: '#E53935',
            background: '#1A1A2E',
            card: 'rgba(255, 255, 255, 0.05)',
            textPrimary: '#F0EFFF',
            textSecondary: '#B0AEC9',
            border: 'rgba(255, 255, 255, 0.1)',
            shadowPrimary: '0 0 15px rgba(142, 36, 170, 0.6), 0 0 5px rgba(142, 36, 170, 0.8)',
            shadowSecondary: '0 0 15px rgba(216, 27, 96, 0.6), 0 0 5px rgba(216, 27, 96, 0.8)',
        },
    },
    'emerald-green': {
        name: 'Emerald Green',
        colors: {
            primary: '#00C853',
            secondary: '#00BFA5',
            accent: '#FFD600',
            success: '#00C853',
            danger: '#DD2C00',
            background: '#001a1a',
            card: 'rgba(255, 255, 255, 0.05)',
            textPrimary: '#E0F2F1',
            textSecondary: '#B2DFDB',
            border: 'rgba(255, 255, 255, 0.1)',
            shadowPrimary: '0 0 15px rgba(0, 200, 83, 0.6), 0 0 5px rgba(0, 200, 83, 0.8)',
            shadowSecondary: '0 0 15px rgba(0, 191, 165, 0.6), 0 0 5px rgba(0, 191, 165, 0.8)',
        },
    },
    'sunset-orange': {
        name: 'Sunset Orange',
        colors: {
            primary: '#FF6D00',
            secondary: '#FFAB00',
            accent: '#3E2723',
            success: '#00C853',
            danger: '#D50000',
            background: '#2d1e18',
            card: 'rgba(255, 255, 255, 0.05)',
            textPrimary: '#FFF3E0',
            textSecondary: '#FFCC80',
            border: 'rgba(255, 255, 255, 0.1)',
            shadowPrimary: '0 0 15px rgba(255, 109, 0, 0.6), 0 0 5px rgba(255, 109, 0, 0.8)',
            shadowSecondary: '0 0 15px rgba(255, 171, 0, 0.6), 0 0 5px rgba(255, 171, 0, 0.8)',
        },
    },
};

interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
    currentTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'neon-blue';
    });

    const applyTheme = (themeName: string) => {
        const selectedTheme = themes[themeName] || themes['neon-blue'];
        const root = window.document.documentElement;
        Object.entries(selectedTheme.colors).forEach(([key, value]) => {
            const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVarName, value);
        });
        localStorage.setItem('app-theme', themeName);
    };

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const contextValue = useMemo(() => ({
        theme,
        setTheme,
        currentTheme: themes[theme] || themes['neon-blue'],
    }), [theme]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
