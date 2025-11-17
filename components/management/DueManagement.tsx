
import React, { useState, useMemo } from 'react';
import useMockData from '../../hooks/useMockData';
import { formatCurrency, exportToCsv } from '../../services/utils';
import Spinner from '../ui/Spinner';
import Icon from '../ui/Icon';

const DueManagement: React.FC = () => {
    const { dues, loading } = useMockData();
    const [filters, setFilters] = useState({ name: '', phone: '' });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const filteredDues = useMemo(() => {
        return dues.filter(due => 
            due.customerName.toLowerCase().includes(filters.name.toLowerCase()) &&
            due.customerPhone.toLowerCase().includes(filters.phone.toLowerCase()) &&
            due.totalDue > 0
        );
    }, [dues, filters]);

    const handleExport = () => {
        const dataToExport = filteredDues.map(d => ({
            "Customer Name": d.customerName,
            "Phone": d.customerPhone,
            "Due Amount": d.totalDue,
            "Original Bill ID": d.billId,
            "Last Payment Date": d.lastPaymentDate ? new Date(d.lastPaymentDate).toLocaleDateString() : 'N/A'
        }));
        exportToCsv(`DueList_${new Date().toISOString().slice(0,10)}.csv`, dataToExport);
    };

    if (loading) return <Spinner />;

    const inputClasses = "w-full bg-background border border-border-color rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all";

    return (
        <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-poppins font-semibold">Due Management</h2>
                 <button onClick={handleExport} className="flex items-center gap-2 bg-secondary/20 text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-secondary/40 transition-all duration-300">
                    <Icon name="download" className="w-5 h-5" />
                    Export to Excel
                </button>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <input name="name" placeholder="Customer Name..." value={filters.name} onChange={handleFilterChange} className={inputClasses}/>
                <input name="phone" placeholder="Phone Number..." value={filters.phone} onChange={handleFilterChange} className={inputClasses}/>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-border-color">
                        <tr>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Due Amount</th>
                            <th className="p-3">Bill ID</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDues.map(due => (
                            <tr key={due.id} className="border-b border-border-color hover:bg-card">
                                <td className="p-3 break-words max-w-xs">{due.customerName}</td>
                                <td className="p-3">{due.customerPhone}</td>
                                <td className="p-3 text-danger font-semibold">{formatCurrency(due.totalDue)}</td>
                                <td className="p-3">{due.billId}</td>
                                <td className="p-3 text-right">
                                     <button className="bg-success/20 text-success px-3 py-1 rounded-md text-sm hover:bg-success/40 mr-2">
                                        Receive Payment
                                    </button>
                                    <a href={`https://wa.me/${due.customerPhone}?text=Reminder: You have a due amount of ${formatCurrency(due.totalDue)} for bill ${due.billId}.`} target="_blank" rel="noopener noreferrer" className="bg-green-600/20 text-green-400 px-3 py-1 rounded-md text-sm hover:bg-green-600/40">
                                        WhatsApp
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredDues.length === 0 && (
                    <div className="text-center py-10 text-text-secondary">No due records match the current filters.</div>
                )}
            </div>
        </div>
    );
};

export default DueManagement;
