
import React, { useState, useEffect } from 'react';
import { getDashboardInsights } from '../../services/geminiService';
import useMockData from '../../hooks/useMockData';
import Icon from '../ui/Icon';
import Spinner from '../ui/Spinner';

const AiInsight: React.FC = () => {
    const [insights, setInsights] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const { bills, products } = useMockData();

    const fetchInsights = async () => {
        setLoading(true);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const todayBills = bills.filter(b => new Date(b.date).toDateString() === today.toDateString());
        const yesterdayBills = bills.filter(b => new Date(b.date).toDateString() === yesterday.toDateString());

        const todaySale = todayBills.reduce((sum, b) => sum + b.grandTotal, 0);
        const yesterdaySale = yesterdayBills.reduce((sum, b) => sum + b.grandTotal, 0);
        const avgBill = todayBills.length > 0 ? todaySale / todayBills.length : 0;
        const lowStockItems = products.filter(p => p.stock < 10 && !p.isService);

        try {
            const result = await getDashboardInsights(todaySale, yesterdaySale, avgBill, lowStockItems);
            setInsights(result);
        } catch (error) {
            setInsights("Could not load insights. Please check your Gemini API key.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if(bills.length > 0 && products.length > 0) {
            fetchInsights();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bills, products]);

    return (
        <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-poppins font-semibold text-text-primary">AI Insights</h3>
                <Icon name="spark" className="w-6 h-6 text-primary" />
            </div>
            {loading ? <div className="h-24"><Spinner /></div> : (
                <div className="space-y-2">
                    {insights.split('\n').map((line, index) => (
                        <p key={index} className="text-text-secondary">{line}</p>
                    ))}
                </div>
            )}
            <button onClick={fetchInsights} disabled={loading} className="text-sm text-primary mt-4 hover:underline disabled:opacity-50">
                {loading ? 'Refreshing...' : 'Refresh Insights'}
            </button>
        </div>
    );
};

export default AiInsight;
