
import React, { useMemo } from 'react';
import useMockData from '../../hooks/useMockData';
import { formatCurrency } from '../../services/utils';
import Icon from '../ui/Icon';
import Spinner from '../ui/Spinner';
import { Page } from '../../App';
import { Bill, Product } from '../../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import AiInsight from './AiInsight';
import { useTheme } from '../../hooks/useTheme';


interface StatCardProps {
    title: string;
    value: string;
    icon: string;
    color: 'primary' | 'secondary' | 'accent' | 'success' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
    const { currentTheme } = useTheme();
    const colorValue = currentTheme.colors[color];

    return (
        <div className="bg-card border border-border-color rounded-xl p-6 flex items-center gap-6 backdrop-blur-md">
            <div className={`p-4 rounded-full`} style={{ backgroundColor: `${colorValue}20`, border: `1px solid ${colorValue}` }}>
                <Icon name={icon} className="w-8 h-8" style={{ color: colorValue }} />
            </div>
            <div>
                <p className="text-text-secondary text-sm">{title}</p>
                <p className="text-2xl font-bold font-poppins text-text-primary">{value}</p>
            </div>
        </div>
    );
}

interface DashboardProps {
    setPage: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setPage }) => {
    const { bills, products, dues, loading } = useMockData();
    const { currentTheme } = useTheme();

    const dashboardData = useMemo(() => {
        if (loading) return null;
        const today = new Date().toDateString();
        const thisMonth = new Date().getMonth();

        const todayBills = bills.filter(b => new Date(b.date).toDateString() === today);
        const monthlyBills = bills.filter(b => new Date(b.date).getMonth() === thisMonth);

        const todaySale = todayBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
        const monthlySale = monthlyBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
        const totalDue = dues.reduce((sum, due) => sum + due.totalDue, 0);

        const salesByDay: { [key: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-US', { weekday: 'short' });
            salesByDay[key] = 0;
        }

        bills.forEach(bill => {
            const billDate = new Date(bill.date);
            const diffDays = (new Date().getTime() - billDate.getTime()) / (1000 * 3600 * 24);
            if (diffDays <= 7) {
                const day = billDate.toLocaleDateString('en-US', { weekday: 'short' });
                salesByDay[day] = (salesByDay[day] || 0) + bill.grandTotal;
            }
        });

        const salesChartData = Object.keys(salesByDay).map(day => ({ name: day, sale: salesByDay[day] }));
        
        const categoryData = products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const pieChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
        
        const lowStockItems = products.filter(p => p.stock < 10 && !p.isService);

        return {
            todaySale,
            monthlySale,
            totalBills: bills.length,
            totalProducts: products.length,
            totalDue,
            salesChartData,
            pieChartData,
            lowStockItems,
            recentBills: bills.slice(0, 5),
        };
    }, [bills, products, dues, loading]);

    if (loading || !dashboardData) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    const PIE_COLORS = [currentTheme.colors.primary, currentTheme.colors.secondary, currentTheme.colors.success, currentTheme.colors.accent];
    const tooltipStyle = { 
        backgroundColor: currentTheme.colors.card, 
        border: `1px solid ${currentTheme.colors.border}`, 
        color: currentTheme.colors.textPrimary 
    };

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard title="Today's Sale" value={formatCurrency(dashboardData.todaySale)} icon="billing" color="primary" />
                <StatCard title="Monthly Sale" value={formatCurrency(dashboardData.monthlySale)} icon="billing" color="secondary" />
                <StatCard title="Total Bills" value={dashboardData.totalBills.toString()} icon="history" color="success" />
                <StatCard title="Total Products" value={dashboardData.totalProducts.toString()} icon="products" color="accent" />
                <StatCard title="Total Due" value={formatCurrency(dashboardData.totalDue)} icon="dues" color="danger" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Sales Chart and AI Insights */}
                <div className="lg:col-span-2 bg-card border border-border-color rounded-xl p-6 backdrop-blur-md">
                     <h3 className="text-xl font-poppins font-semibold mb-4 text-text-primary">7-Day Sales Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dashboardData.salesChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis dataKey="name" stroke={currentTheme.colors.textSecondary} />
                            <YAxis stroke={currentTheme.colors.textSecondary} tickFormatter={(value) => formatCurrency(value as number)}/>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="sale" stroke={currentTheme.colors.primary} strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <div className="space-y-6">
                    <AiInsight />
                    <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md">
                        <h3 className="text-xl font-poppins font-semibold mb-4 text-text-primary">Category Distribution</h3>
                        <ResponsiveContainer width="100%" height={250}>
                             <PieChart>
                                <Pie data={dashboardData.pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                {dashboardData.pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
            </div>

             {/* Quick Actions and Low Stock */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button onClick={() => setPage('billing')} className="bg-primary/20 border border-primary text-primary p-6 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-primary/30 transition-all duration-300">
                    <Icon name="billing" className="w-10 h-10" />
                    <span className="font-semibold">New Bill</span>
                </button>
                <button onClick={() => setPage('dues')} className="bg-accent/20 border border-accent text-accent p-6 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-accent/30 transition-all duration-300">
                    <Icon name="dues" className="w-10 h-10" />
                    <span className="font-semibold">Manage Dues</span>
                </button>
                 <button onClick={() => setPage('history')} className="bg-success/20 border border-success text-success p-6 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-success/30 transition-all duration-300">
                    <Icon name="history" className="w-10 h-10" />
                    <span className="font-semibold">Bill History</span>
                </button>
                 <button onClick={() => setPage('reports')} className="bg-secondary/20 border border-secondary text-secondary p-6 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-secondary/30 transition-all duration-300">
                    <Icon name="reports" className="w-10 h-10" />
                    <span className="font-semibold">View Reports</span>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
