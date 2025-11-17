import React, { useMemo } from 'react';
import useMockData from '../../hooks/useMockData';
import { formatCurrency } from '../../services/utils';
import Icon from '../ui/Icon';
import Spinner from '../ui/Spinner';
import { Page } from '../../App';
import { Bill, Product, BillType } from '../../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import AiInsight from './AiInsight';
import { useTheme } from '../../hooks/useTheme';


interface StatCardProps {
    title: string;
    value: string;
    icon: string;
    color: 'primary' | 'secondary' | 'accent' | 'success' | 'danger';
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => {
    const { currentTheme } = useTheme();
    const colorValue = currentTheme.colors[color];

    const cardClasses = `relative bg-card border border-border-color rounded-xl p-6 overflow-hidden backdrop-blur-md transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''}`;
    
    return (
        <div className={cardClasses} onClick={onClick}>
            <div className="relative z-10">
                <p className="text-text-secondary text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold font-poppins text-text-primary mt-1">{value}</p>
            </div>
             <Icon name={icon} className="absolute -right-4 -bottom-4 z-0 w-24 h-24 opacity-10" style={{ color: colorValue }}/>
        </div>
    );
}

const RecentBills: React.FC<{ bills: Bill[]; setPage: (page: Page) => void }> = ({ bills, setPage }) => (
    <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md h-full">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-poppins font-semibold text-text-primary">Recent Bills</h3>
            <button onClick={() => setPage('history')} className="text-sm text-primary hover:underline">View All</button>
        </div>
        <div className="space-y-3">
            {bills.slice(0, 5).map(bill => (
                <div key={bill.id} className="flex justify-between items-center bg-background p-3 rounded-lg">
                    <div>
                        <p className="font-semibold">{bill.patient?.name || bill.customerName || 'N/A'}</p>
                        <p className="text-xs text-text-secondary">{bill.billNo} - {new Date(bill.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">{formatCurrency(bill.grandTotal)}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${bill.dueAmount > 0 ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                            {bill.dueAmount > 0 ? 'Due' : 'Paid'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const LowStockAlerts: React.FC<{ products: Product[]; setPage: (page: Page) => void }> = ({ products, setPage }) => (
     <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md h-full">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-poppins font-semibold text-text-primary">Low Stock Alerts</h3>
            <button onClick={() => setPage('products')} className="text-sm text-primary hover:underline">Manage Stock</button>
        </div>
         <div className="space-y-2">
            {products.length > 0 ? products.slice(0,5).map(product => (
                 <div key={product.id} className="flex justify-between items-center bg-background p-3 rounded-lg">
                     <p className="font-medium">{product.name}</p>
                     <p className="text-danger font-bold">{product.stock} left</p>
                 </div>
            )) : (
                <p className="text-text-secondary text-center py-8">No items are low on stock. Great job!</p>
            )}
        </div>
    </div>
);


const Dashboard: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
    const { bills, products, dues, loading } = useMockData();
    const { currentTheme } = useTheme();

    const dashboardData = useMemo(() => {
        if (loading) return null;
        const today = new Date().toDateString();

        const todayBills = bills.filter(b => new Date(b.date).toDateString() === today);
        const todaySale = todayBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
        const totalDue = dues.reduce((sum, due) => sum + due.totalDue, 0);
        const lowStockItems = products.filter(p => p.stock < 10 && !p.isService);

        const salesByDay: { [key: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-US', { weekday: 'short' });
            salesByDay[key] = 0;
        }

        bills.filter(bill => {
            const billDate = new Date(bill.date);
            const diffDays = (new Date().setHours(0,0,0,0) - billDate.setHours(0,0,0,0)) / (1000 * 3600 * 24);
            return diffDays < 7;
        }).forEach(bill => {
            const day = new Date(bill.date).toLocaleDateString('en-US', { weekday: 'short' });
            salesByDay[day] = (salesByDay[day] || 0) + bill.grandTotal;
        });

        const salesChartData = Object.keys(salesByDay).map(day => ({ name: day, sale: salesByDay[day] }));
        
        return {
            todaySale,
            billsToday: todayBills.length,
            totalDue,
            lowStockCount: lowStockItems.length,
            salesChartData,
            recentBills: bills,
            lowStockItems,
        };
    }, [bills, products, dues, loading]);

    if (loading || !dashboardData) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }
    
    const tooltipStyle = { 
        backgroundColor: currentTheme.colors.card, 
        border: `1px solid ${currentTheme.colors.border}`, 
        color: currentTheme.colors.textPrimary,
        borderRadius: '0.75rem' 
    };

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Today's Sale" value={formatCurrency(dashboardData.todaySale)} icon="billing" color="primary" onClick={() => setPage('history')} />
                <StatCard title="Bills Today" value={dashboardData.billsToday.toString()} icon="history" color="secondary" onClick={() => setPage('history')} />
                <StatCard title="Total Dues" value={formatCurrency(dashboardData.totalDue)} icon="dues" color="danger" onClick={() => setPage('dues')} />
                <StatCard title="Low Stock Items" value={dashboardData.lowStockCount.toString()} icon="products" color="accent" onClick={() => setPage('products')} />
            </div>

            {/* Main Chart and AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card border border-border-color rounded-xl p-6 backdrop-blur-md">
                     <h3 className="text-xl font-poppins font-semibold mb-4 text-text-primary">7-Day Sales Trend</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={dashboardData.salesChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis dataKey="name" stroke={currentTheme.colors.textSecondary} />
                            <YAxis stroke={currentTheme.colors.textSecondary} tickFormatter={(value) => formatCurrency(value as number)}/>
                            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
                            <Line type="monotone" dataKey="sale" stroke={currentTheme.colors.primary} strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8, style: {stroke: currentTheme.colors.primary, fill: currentTheme.colors.background} }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <AiInsight />
            </div>

             {/* Recent Bills and Low Stock */}
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <RecentBills bills={dashboardData.recentBills} setPage={setPage} />
                </div>
                <div className="lg:col-span-2">
                     <LowStockAlerts products={dashboardData.lowStockItems} setPage={setPage} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;