
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Page } from '../../App';
import Icon from '../ui/Icon';
import { useAuth } from '../../hooks/useAuth';

interface LayoutProps {
    children: React.ReactNode;
    page: Page;
    setPage: (page: Page) => void;
}

const pageTitles: Record<Page, string> = {
    dashboard: 'Dashboard',
    billing: 'New Bill',
    history: 'Bill History',
    dues: 'Due Management',
    reports: 'Reports',
    products: 'Product Management',
    tests: 'Test Management',
    settings: 'Settings',
    salary: 'Salary Management',
    expenses: 'Daily Expenses',
    parties: 'Party Payments',
    devices: 'Device Management',
}

const Layout: React.FC<LayoutProps> = ({ children, page, setPage }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();
    
    return (
        <div className="min-h-screen flex font-sans bg-background">
            <Sidebar currentPage={page} setPage={setPage} isOpen={sidebarOpen} setIsOpen={setSidebarOpen}/>
            <div className="flex-1 flex flex-col transition-all duration-300">
                <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between p-4 border-b border-border-color">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden text-text-primary">
                           <Icon name="menu" />
                        </button>
                        <h1 className="text-xl md:text-2xl font-poppins font-semibold text-text-primary tracking-wide">
                            {pageTitles[page]}
                        </h1>
                    </div>
                    <div className='text-right'>
                        <p className="text-text-primary font-semibold">{user?.fullName}</p>
                        <p className="text-sm text-text-secondary">{user?.role}</p>
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
