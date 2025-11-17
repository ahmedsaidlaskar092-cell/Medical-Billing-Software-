import React, { useState, useMemo } from 'react';
import useMockData from '../../hooks/useMockData';
import { DailyExpense } from '../../types';
import Spinner from '../ui/Spinner';
import { formatCurrency, exportToCsv } from '../../services/utils';
import Modal from '../ui/Modal';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import Icon from '../ui/Icon';
import { useToast } from '../../hooks/useToast';

const DailyExpenses: React.FC = () => {
    const { dailyExpenses, loading, addDailyExpense, updateDailyExpense, deleteDailyExpense } = useMockData();
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<DailyExpense | null>(null);
    
    const initialFormState: Omit<DailyExpense, 'id'> = {
        date: new Date().toISOString().slice(0, 10),
        description: '',
        category: '',
        amount: 0,
    };
    const [expenseForm, setExpenseForm] = useState(initialFormState);

    const [filters, setFilters] = useState({ category: '', dateFrom: '', dateTo: '' });

    const filteredExpenses = useMemo(() => {
        return dailyExpenses.filter(expense => {
            const categoryFilter = !filters.category || expense.category.toLowerCase().includes(filters.category.toLowerCase());
            const date = new Date(expense.date);
            const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
            const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
            if(dateFrom) dateFrom.setHours(0,0,0,0);
            if(dateTo) dateTo.setHours(23,59,59,999);
            const dateFilter = (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
            return categoryFilter && dateFilter;
        });
    }, [dailyExpenses, filters]);
    
    const totalExpenses = useMemo(() => {
        return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    }, [filteredExpenses]);

    const handleOpenModal = (expense?: DailyExpense) => {
        setSelectedExpense(expense || null);
        setExpenseForm(expense || initialFormState);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedExpense(null);
        setExpenseForm(initialFormState);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setExpenseForm(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedExpense) {
                updateDailyExpense({ ...expenseForm, id: selectedExpense.id });
                addToast({ message: 'Expense updated successfully!', type: 'success' });
            } else {
                addDailyExpense(expenseForm);
                addToast({ message: 'Expense added successfully!', type: 'success' });
            }
            handleCloseModal();
        } catch (error) {
            addToast({ message: 'Failed to save expense.', type: 'error' });
        }
    };
    
    const handleDeleteClick = (expense: DailyExpense) => {
        setSelectedExpense(expense);
        setIsDeleteConfirmOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (selectedExpense) {
            deleteDailyExpense(selectedExpense.id);
            addToast({ message: 'Expense deleted.', type: 'success' });
        }
        setIsDeleteConfirmOpen(false);
        setSelectedExpense(null);
    };

    const handleExport = () => {
        const data = filteredExpenses.map(e => ({
            "Date": new Date(e.date).toLocaleDateString(),
            "Description": e.description,
            "Category": e.category,
            "Amount": e.amount,
        }));
        exportToCsv(`DailyExpenses_${new Date().toISOString().slice(0,10)}.csv`, data);
    };

    if (loading) return <Spinner />;

    const inputClasses = "w-full bg-card border border-border-color rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all";

    return (
        <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-poppins font-semibold">Daily Expenses</h2>
                <div className="flex items-center gap-4">
                     <button onClick={handleExport} className="flex items-center gap-2 bg-secondary/20 text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-secondary/40 transition-all duration-300">
                        <Icon name="download" className="w-5 h-5"/> Export to Excel
                    </button>
                    <button onClick={() => handleOpenModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-300 shadow-primary">
                        Add Expense
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border border-border-color rounded-lg">
                <input name="category" placeholder="Filter by Category..." value={filters.category} onChange={e => setFilters(prev => ({...prev, category: e.target.value}))} className={inputClasses}/>
                <div className="flex items-center gap-2">
                    <input name="dateFrom" type="date" value={filters.dateFrom} onChange={e => setFilters(prev => ({...prev, dateFrom: e.target.value}))} className={inputClasses} title="Start Date"/>
                    <input name="dateTo" type="date" value={filters.dateTo} onChange={e => setFilters(prev => ({...prev, dateTo: e.target.value}))} className={inputClasses} title="End Date"/>
                </div>
                <div className="bg-background p-4 rounded-lg text-center">
                    <p className="text-text-secondary text-sm">Total Expenses</p>
                    <p className="text-2xl font-bold font-poppins text-danger">{formatCurrency(totalExpenses)}</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-border-color">
                        <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map(exp => (
                            <tr key={exp.id} className="border-b border-border-color hover:bg-card">
                                <td className="p-3">{new Date(exp.date).toLocaleDateString()}</td>
                                <td className="p-3">{exp.description}</td>
                                <td className="p-3">{exp.category}</td>
                                <td className="p-3">{formatCurrency(exp.amount)}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => handleOpenModal(exp)} className="bg-secondary/20 text-secondary px-3 py-1 rounded-md text-sm hover:bg-secondary/40">Edit</button>
                                    <button onClick={() => handleDeleteClick(exp)} className="bg-danger/20 text-danger px-3 py-1 rounded-md text-sm hover:bg-danger/40">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredExpenses.length === 0 && <div className="text-center py-10 text-text-secondary">No expenses match the current filters.</div>}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedExpense ? 'Edit Expense' : 'Add New Expense'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="date" type="date" value={expenseForm.date} onChange={handleFormChange} className={inputClasses} required />
                    <input name="description" value={expenseForm.description} onChange={handleFormChange} placeholder="Description" className={inputClasses} required />
                    <input name="category" value={expenseForm.category} onChange={handleFormChange} placeholder="Category" className={inputClasses} required />
                    <input name="amount" type="number" step="0.01" value={expenseForm.amount} onChange={handleFormChange} placeholder="Amount" className={inputClasses} required />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={handleCloseModal} className="bg-card text-text-primary px-6 py-2 rounded-lg hover:opacity-80">Cancel</button>
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 shadow-primary">Save Expense</button>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationDialog 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Expense"
                message={`Are you sure you want to delete this expense? This action cannot be undone.`}
            />
        </div>
    );
};

export default DailyExpenses;