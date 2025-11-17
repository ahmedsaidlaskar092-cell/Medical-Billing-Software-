
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../ui/Icon';
import { Page } from '../../App';
import { UserRole } from '../../types';

interface NavItem {
    name: Page;
    label: string;
    icon: string;
    roles: UserRole[];
}

const navItems: NavItem[] = [
    { name: 'dashboard', label: 'Dashboard', icon: 'dashboard', roles: [UserRole.CENTER, UserRole.OWNER] },
    { name: 'billing', label: 'New Bill', icon: 'billing', roles: [UserRole.CENTER] },
    { name: 'history', label: 'Bill History', icon: 'history', roles: [UserRole.CENTER, UserRole.OWNER] },
    { name: 'dues', label: 'Dues', icon: 'dues', roles: [UserRole.CENTER, UserRole.OWNER] },
    { name: 'expenses', label: 'Expenses', icon: 'receipt-refund', roles: [UserRole.CENTER] },
    { name: 'reports', label: 'Reports', icon: 'reports', roles: [UserRole.CENTER, UserRole.OWNER] },
    { name: 'products', label: 'Products', icon: 'products', roles: [UserRole.CENTER] },
    { name: 'tests', label: 'Tests', icon: 'tests', roles: [UserRole.CENTER] },
    { name: 'salary', label: 'Salary', icon: 'wallet', roles: [UserRole.CENTER] },
    { name: 'parties', label: 'Parties', icon: 'users', roles: [UserRole.CENTER] },
    { name: 'devices', label: 'Device Management', icon: 'devices', roles: [UserRole.OWNER] },
    { name: 'settings', label: 'Settings', icon: 'settings', roles: [UserRole.CENTER] },
];

interface SidebarProps {
    currentPage: Page;
    setPage: (page: Page) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage, isOpen, setIsOpen }) => {
    const { logout, role } = useAuth();

    const handleNavigation = (page: Page) => {
        setPage(page);
        setIsOpen(false);
    }

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
            <aside className={`fixed md:relative top-0 left-0 h-full bg-background border-r border-border-color w-64 z-40 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-border-color flex items-center justify-between">
                        <h2 className="text-2xl font-poppins font-bold text-primary">Smart Bill</h2>
                         <button onClick={() => setIsOpen(false)} className="md:hidden text-text-primary">
                           <Icon name="close" />
                        </button>
                    </div>
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.filter(item => item.roles.includes(role!)).map((item) => (
                            <button
                                key={item.name}
                                onClick={() => handleNavigation(item.name)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${currentPage === item.name ? 'bg-primary/20 text-primary shadow-primary' : 'text-text-secondary hover:bg-card hover:text-text-primary'}`}
                            >
                                <Icon name={item.icon} className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-border-color">
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-card hover:text-text-primary transition-all duration-200"
                        >
                            <Icon name="logout" className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
