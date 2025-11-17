
import React, { useState, useMemo } from 'react';
import useMockData from '../../hooks/useMockData';
import { Bill, BillType } from '../../types';
import { formatCurrency, exportToCsv } from '../../services/utils';
import Spinner from '../ui/Spinner';
import PrintModal from '../print/PrintModal';
import Icon from '../ui/Icon';

const BillHistory: React.FC = () => {
    const { bills, loading } = useMockData();
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [filters, setFilters] = useState({
        customer: '',
        billNo: '',
        status: 'all', // all, paid, due
        dateFrom: '',
        dateTo: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const filteredBills = useMemo(() => {
        return bills.filter(bill => {
            const customerName = bill.patient?.name || bill.customerName || '';
            const statusFilter = filters.status === 'all' || 
                                 (filters.status === 'paid' && bill.dueAmount <= 0) || 
                                 (filters.status === 'due' && bill.dueAmount > 0);
            
            const date = new Date(bill.date);
            const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
            const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
            if(dateFrom) dateFrom.setHours(0,0,0,0);
            if(dateTo) dateTo.setHours(23,59,59,999);


            const dateFilter = (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);

            return (
                customerName.toLowerCase().includes(filters.customer.toLowerCase()) &&
                bill.billNo.toLowerCase().includes(filters.billNo.toLowerCase()) &&
                statusFilter &&
                dateFilter
            );
        });
    }, [bills, filters]);

    const handleExport = () => {
        const dataToExport = filteredBills.map(b => ({
            "Bill No": b.billNo,
            "Date": new Date(b.date).toLocaleDateString(),
            "Customer/Patient": b.patient?.name || b.customerName || 'N/A',
            "Phone": b.patient?.phone || 'N/A',
            "Type": b.billType,
            "Subtotal": b.subtotal,
            "Discount": b.discount,
            "Grand Total": b.grandTotal,
            "Paid Amount": b.paidAmount,
            "Due Amount": b.dueAmount,
            "Payment Mode": b.payments.map(p => p.mode).join(', '),
        }));
        exportToCsv(`BillHistory_${new Date().toISOString().slice(0,10)}.csv`, dataToExport);
    };

    if (loading) return <Spinner />;

    const inputClasses = "w-full bg-background border border-border-color rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all";

    return (
        <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-poppins font-semibold">Bill History</h2>
                <button onClick={handleExport} className="flex items-center gap-2 bg-secondary/20 text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-secondary/40 transition-all duration-300">
                    <Icon name="download" className="w-5 h-5" />
                    Export to Excel
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <input name="customer" placeholder="Customer/Patient Name..." value={filters.customer} onChange={handleFilterChange} className={inputClasses}/>
                <input name="billNo" placeholder="Bill No..." value={filters.billNo} onChange={handleFilterChange} className={inputClasses}/>
                <select name="status" value={filters.status} onChange={handleFilterChange} className={inputClasses}>
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="due">Due</option>
                </select>
                <div className="flex items-center gap-2">
                    <input name="dateFrom" type="date" value={filters.dateFrom} onChange={handleFilterChange} className={inputClasses} title="Start Date"/>
                    <input name="dateTo" type="date" value={filters.dateTo} onChange={handleFilterChange} className={inputClasses} title="End Date"/>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-border-color">
                        <tr>
                            <th className="p-3">Bill No</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Customer/Patient</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Due</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBills.map(bill => (
                            <tr key={bill.id} className="border-b border-border-color hover:bg-card">
                                <td className="p-3">{bill.billNo}</td>
                                <td className="p-3">{new Date(bill.date).toLocaleDateString()}</td>
                                <td className="p-3 break-words max-w-xs">{bill.patient?.name || bill.customerName || 'N/A'}</td>
                                <td className="p-3">{formatCurrency(bill.grandTotal)}</td>
                                <td className="p-3">
                                    <span className={bill.dueAmount > 0 ? 'text-danger' : 'text-success'}>
                                        {formatCurrency(bill.dueAmount)}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <button onClick={() => setSelectedBill(bill)} className="bg-primary/20 text-primary px-3 py-1 rounded-md text-sm hover:bg-primary/40">
                                        View/Print
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredBills.length === 0 && (
                    <div className="text-center py-10 text-text-secondary">No bills match the current filters.</div>
                )}
            </div>
            {selectedBill && (
                <PrintModal bill={selectedBill} onClose={() => setSelectedBill(null)} />
            )}
        </div>
    );
};

export default BillHistory;
