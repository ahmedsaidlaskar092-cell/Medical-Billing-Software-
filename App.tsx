
import React, { useState, useMemo, useCallback, Suspense, lazy, useEffect } from 'react';
import { AuthContext, AuthState } from './hooks/useAuth';
import { User, UserRole } from './types';
import LandingPage from './components/auth/LandingPage';
import Layout from './components/layout/Layout';
import { mockUsers, mockOwnerDevices } from './services/mockData';
import { ThemeProvider } from './hooks/useTheme';
import Spinner from './components/ui/Spinner';
import SplashScreen from './components/ui/SplashScreen';

export type Page = 'dashboard' | 'billing' | 'history' | 'dues' | 'reports' | 'products' | 'tests' | 'settings' | 'salary' | 'expenses' | 'parties' | 'devices';

// Lazy load page components for code splitting
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const Billing = lazy(() => import('./components/billing/Billing'));
const BillHistory = lazy(() => import('./components/history/BillHistory'));
const DueManagement = lazy(() => import('./components/management/DueManagement'));
const Settings = lazy(() => import('./components/settings/Settings'));
const Reports = lazy(() => import('./components/reports/Reports'));
const ProductManagement = lazy(() => import('./components/management/ProductManagement'));
const TestManagement = lazy(() => import('./components/management/TestManagement'));
const SalaryManagement = lazy(() => import('./components/management/SalaryManagement'));
const DailyExpenses = lazy(() => import('./components/management/DailyExpenses'));
const PartyManagement = lazy(() => import('./components/management/PartyManagement'));
const DeviceManagement = lazy(() => import('./components/management/DeviceManagement'));


const AppContent: React.FC = () => {
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        role: null,
        isLoading: true,
    });
    const [page, setPage] = useState<Page>('dashboard');

    const [ownerDevices, setOwnerDevices] = useState<string[]>(mockOwnerDevices);

    useEffect(() => {
        // Simulate initial app setup/hydration
        const timer = setTimeout(() => setIsAppLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const login = useCallback((email: string, password: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = mockUsers.find(u => u.email === email && u.password === password);
                if (user) {
                    if (user.role === UserRole.OWNER) {
                        const deviceId = user.id; // Using user ID as a unique device identifier for this mock setup
                        if (ownerDevices.length >= 4 && !ownerDevices.includes(deviceId)) {
                            reject("Maximum 4 owner devices allowed. Remove a device to continue.");
                            return;
                        }
                        if (!ownerDevices.includes(deviceId)) {
                           setOwnerDevices(prev => [...prev, deviceId]);
                        }
                    }
                    setAuthState({ isAuthenticated: true, user, role: user.role, isLoading: false });
                    resolve("Login successful");
                } else {
                    reject("Invalid email or password");
                }
            }, 500);
        });
    }, [ownerDevices]);
    
    const logout = useCallback(() => {
        setAuthState({ isAuthenticated: false, user: null, role: null, isLoading: false });
        // Note: In a real app, you might not want to automatically remove the device on logout,
        // but for this mock, it simulates freeing up a slot.
        if (authState.user && authState.role === UserRole.OWNER) {
            // setOwnerDevices(prev => prev.filter(id => id !== authState.user!.id));
        }
    }, [authState.user, authState.role]);

    const removeDevice = useCallback((userIdToRemove: string) => {
        setOwnerDevices(prev => prev.filter(id => id !== userIdToRemove));
    }, []);

    const signup = useCallback((fullName: string, email: string, password: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (mockUsers.some(u => u.email === email)) {
                    reject("User with this email already exists.");
                } else {
                    const newUser: User = {
                        id: `user-${Date.now()}`,
                        fullName,
                        email,
                        password, // In a real app, hash this password
                        role: UserRole.CENTER, // Default new signups to Center user
                    };
                    mockUsers.push(newUser);
                    resolve("Signup successful. Please log in.");
                }
            }, 500);
        });
    }, []);

    const authContextValue = useMemo(() => ({ ...authState, login, logout, signup }), [authState, login, logout, signup]);

    const renderPage = () => {
        switch(page) {
            case 'dashboard': return <Dashboard setPage={setPage}/>;
            case 'billing': return <Billing />;
            case 'history': return <BillHistory />;
            case 'dues': return <DueManagement />;
            case 'reports': return <Reports />;
            case 'products': return <ProductManagement />;
            case 'tests': return <TestManagement />;
            case 'devices': return <DeviceManagement authorizedDevices={ownerDevices} allUsers={mockUsers} removeDevice={removeDevice} />;
            case 'settings': return <Settings />;
            case 'salary': return <SalaryManagement />;
            case 'expenses': return <DailyExpenses />;
            case 'parties': return <PartyManagement />;
            default: return <Dashboard setPage={setPage} />;
        }
    }

    if (isAppLoading) {
        return <SplashScreen />;
    }

    if (!authContextValue.isAuthenticated) {
        return (
            <AuthContext.Provider value={authContextValue}>
                <LandingPage />
            </AuthContext.Provider>
        );
    }
    
    return (
        <AuthContext.Provider value={authContextValue}>
            <Layout page={page} setPage={setPage}>
                <Suspense fallback={<div className="flex justify-center items-center h-full w-full"><Spinner /></div>}>
                    {renderPage()}
                </Suspense>
            </Layout>
        </AuthContext.Provider>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App;