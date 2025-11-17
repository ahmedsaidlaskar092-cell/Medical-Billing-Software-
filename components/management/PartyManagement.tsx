
import React, { useState, useMemo } from 'react';
import useMockData from '../../hooks/useMockData';
import { Party, PartyPayment, PaymentMode } from '../../types';
import Spinner from '../ui/Spinner';
import { formatCurrency, exportToCsv } from '../../services/utils';
import Modal from '../ui/Modal';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import Icon from '../ui/Icon';

const PartyManagement: React.FC = () => {
    const { 
        parties, 
        partyPayments, 
        loading, 
        addParty, 
        updateParty, 
        deleteParty,
        addPartyPayment
    } = useMockData();

    const [activeTab, setActiveTab] = useState<'parties' | 'records'>('parties');
    const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedParty, setSelectedParty] = useState<Party | null>(null);

    const initialPartyForm: Omit<Party, 'id'> = { name: '', phone: '', contactPerson: '', email: '', address: '' };
    const [partyForm, setPartyForm] = useState(initialPartyForm);
    
    const initialPaymentForm: Omit<PartyPayment, 'id'> = { partyId: '', date: new Date().toISOString().slice(0,10), amount: 0, paymentMode: PaymentMode.UPI, notes: '' };
    const [paymentForm, setPaymentForm] = useState(initialPaymentForm);

    const [filters, setFilters] = useState({ partyId: 'all', dateFrom: '', dateTo: '' });

    const handleOpenPartyModal = (party?: Party) => {
        setSelectedParty(party || null);
        setPartyForm(party || initialPartyForm);
        setIsPartyModalOpen(true);
    };

    const handleClosePartyModal = () => {
        setIsPartyModalOpen(false);
        setSelectedParty(null);
        setPartyForm(initialPartyForm);
    };
    
    const handleOpenPaymentModal = () => setIsPaymentModalOpen(true);
    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setPaymentForm(initialPaymentForm);
    }
    
    const handlePartySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedParty) {
            updateParty({ ...partyForm, id: selectedParty.id });
        } else {
            addParty(partyForm);
        }
        handleClosePartyModal();
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!paymentForm.partyId) {
            alert("Please select a party.");
            return;
        }
        addPartyPayment(paymentForm);
        handleClosePaymentModal();
    }
    
    const handleDeleteClick = (party: Party) => {
        setSelectedParty(party);
        setIsDeleteConfirmOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (selectedParty) {
            deleteParty(selectedParty.id);
        }
        setIsDeleteConfirmOpen(false);
        setSelectedParty(null);
    };
    
    const partyMap = useMemo(() => {
        return parties.reduce((acc, p) => {
            acc[p.id] = p.name;
            return acc;
        }, {} as Record<string, string>);
    }, [parties]);

    const filteredPayments = useMemo(() => {
        return partyPayments.filter(p => {
             const partyFilter = filters.partyId === 'all' || p.partyId === filters.partyId;
             const date = new Date(p.date);
             const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
             const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
             if(dateFrom) dateFrom.setHours(0,0,0,0);
             if(dateTo) dateTo.setHours(23,59,59,999);
             const dateFilter = (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
             return partyFilter && dateFilter;
        });
    }, [partyPayments, filters]);

    const handleExport = () => {
        const data = filteredPayments.map(p => ({
            "Date": new Date(p.date).toLocaleDateString(),
            "Party": partyMap[p.partyId] || 'N/A',
            "Payment Mode": p.paymentMode,
            "Amount": p.amount,
            "Notes": p.notes || ''
        }));
        exportToCsv(`PartyPayments_${new Date().toISOString().slice(0,10)}.csv`, data);
    }

    if (loading) return <Spinner />;

    const inputClasses = "w-full bg-card border border-border-color rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all";
    const tabButtonClasses = (isActive: boolean) => `px-6 py-3 font-semibold ${isActive ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`;

    return (
        <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md">
            <h2 className="text-2xl font-poppins font-semibold mb-6">Party Management</h2>

            <div className="flex border-b border-border-color mb-6">
                <button onClick={() => setActiveTab('parties')} className={tabButtonClasses(activeTab === 'parties')}>Parties</button>
                <button onClick={() => setActiveTab('records')} className={tabButtonClasses(activeTab === 'records')}>Payment Records</button>
            </div>

            {activeTab === 'parties' && (
                <div>
                    <div className="flex justify-end mb-6">
                        <button onClick={() => handleOpenPartyModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-300 shadow-primary">
                            Add Party
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="border-b border-border-color">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Contact Person</th>
                                    <th className="p-3">Phone</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parties.map(p => (
                                     <tr key={p.id} className="border-b border-border-color hover:bg-card">
                                        <td className="p-3">{p.name}</td>
                                        <td className="p-3">{p.contactPerson}</td>
                                        <td className="p-3">{p.phone}</td>
                                        <td className="p-3">{p.email}</td>
                                        <td className="p-3 text-right space-x-2">
                                            <button onClick={() => handleOpenPartyModal(p)} className="bg-secondary/20 text-secondary px-3 py-1 rounded-md text-sm hover:bg-secondary/40">Edit</button>
                                            <button onClick={() => handleDeleteClick(p)} className="bg-danger/20 text-danger px-3 py-1 rounded-md text-sm hover:bg-danger/40">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'records' && (
                 <div>
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                        <button onClick={handleOpenPaymentModal} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-300 shadow-primary">
                           Record Payment
                        </button>
                        <button onClick={handleExport} className="flex items-center gap-2 bg-secondary/20 text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-secondary/40 transition-all duration-300">
                           <Icon name="download" className="w-5 h-5"/> Export to Excel
                        </button>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <select name="partyId" value={filters.partyId} onChange={(e) => setFilters(prev => ({...prev, partyId: e.target.value}))} className={inputClasses}>
                            <option value="all">All Parties</option>
                            {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                         <div className="flex items-center gap-2 md:col-span-2">
                             <input name="dateFrom" type="date" value={filters.dateFrom} onChange={(e) => setFilters(prev => ({...prev, dateFrom: e.target.value}))} className={inputClasses} title="Start Date"/>
                             <input name="dateTo" type="date" value={filters.dateTo} onChange={(e) => setFilters(prev => ({...prev, dateTo: e.target.value}))} className={inputClasses} title="End Date"/>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                         <table className="w-full text-left">
                            <thead className="border-b border-border-color">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Party</th>
                                    <th className="p-3">Mode</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                               {filteredPayments.map(p => (
                                     <tr key={p.id} className="border-b border-border-color hover:bg-card">
                                        <td className="p-3">{new Date(p.date).toLocaleDateString()}</td>
                                        <td className="p-3">{partyMap[p.partyId] || 'N/A'}</td>
                                        <td className="p-3">{p.paymentMode}</td>
                                        <td className="p-3">{formatCurrency(p.amount)}</td>
                                        <td className="p-3">{p.notes}</td>
                                    </tr>
                               ))}
                            </tbody>
                        </table>
                        {filteredPayments.length === 0 && <div className="text-center py-10 text-text-secondary">No payment records match filters.</div>}
                    </div>
                </div>
            )}
            
            {/* Modals */}
             <Modal isOpen={isPartyModalOpen} onClose={handleClosePartyModal} title={selectedParty ? 'Edit Party' : 'Add Party'}>
                <form onSubmit={handlePartySubmit} className="space-y-4">
                    <input name="name" value={partyForm.name} onChange={e => setPartyForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Party Name" className={inputClasses} required />
                    <input name="contactPerson" value={partyForm.contactPerson} onChange={e => setPartyForm(prev => ({ ...prev, contactPerson: e.target.value }))} placeholder="Contact Person" className={inputClasses} />
                    <input name="phone" value={partyForm.phone} onChange={e => setPartyForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone Number" className={inputClasses} required />
                    <input name="email" value={partyForm.email} onChange={e => setPartyForm(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" className={inputClasses} />
                    <input name="address" value={partyForm.address} onChange={e => setPartyForm(prev => ({ ...prev, address: e.target.value }))} placeholder="Address" className={inputClasses} />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={handleClosePartyModal} className="bg-card text-text-primary px-6 py-2 rounded-lg hover:opacity-80">Cancel</button>
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 shadow-primary">Save Party</button>
                    </div>
                </form>
            </Modal>
            <Modal isOpen={isPaymentModalOpen} onClose={handleClosePaymentModal} title="Record Party Payment">
                 <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <select name="partyId" value={paymentForm.partyId} onChange={e => setPaymentForm(p => ({...p, partyId: e.target.value}))} className={inputClasses} required>
                        <option value="">Select Party</option>
                        {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select name="paymentMode" value={paymentForm.paymentMode} onChange={e => setPaymentForm(p => ({...p, paymentMode: e.target.value as PaymentMode}))} className={inputClasses} required>
                        {Object.values(PaymentMode).map(mode => <option key={mode} value={mode}>{mode}</option>)}
                    </select>
                    <input name="amount" type="number" value={paymentForm.amount} onChange={e => setPaymentForm(p => ({...p, amount: parseFloat(e.target.value) || 0}))} placeholder="Amount" className={inputClasses} required />
                    <input name="date" type="date" value={paymentForm.date} onChange={e => setPaymentForm(p => ({...p, date: e.target.value}))} className={inputClasses} required />
                    <input name="notes" value={paymentForm.notes} onChange={e => setPaymentForm(p => ({...p, notes: e.target.value}))} placeholder="Notes (e.g., Invoice #)" className={inputClasses} />
                    <div className="flex justify-end gap-4 pt-4">
                         <button type="button" onClick={handleClosePaymentModal} className="bg-card text-text-primary px-6 py-2 rounded-lg hover:opacity-80">Cancel</button>
                         <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 shadow-primary">Record Payment</button>
                    </div>
                </form>
            </Modal>
            <ConfirmationDialog 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Party"
                message={`Are you sure you want to delete "${selectedParty?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default PartyManagement;
