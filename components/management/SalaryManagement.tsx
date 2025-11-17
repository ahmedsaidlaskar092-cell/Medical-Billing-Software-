import React, { useState, useMemo } from 'react';
import useMockData from '../../hooks/useMockData';
import { Employee, SalaryPayment, SalaryPaymentType } from '../../types';
import Spinner from '../ui/Spinner';
import { formatCurrency, exportToCsv } from '../../services/utils';
import Modal from '../ui/Modal';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import Icon from '../ui/Icon';
import { useToast } from '../../hooks/useToast';

const SalaryManagement: React.FC = () => {
    const { 
        employees, 
        salaryPayments, 
        loading, 
        addEmployee, 
        updateEmployee, 
        deleteEmployee,
        addSalaryPayment
    } = useMockData();
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState<'employees' | 'records'>('employees');
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const initialEmployeeForm: Omit<Employee, 'id'> = { name: '', role: '', monthlySalary: 0, phone: '' };
    const [employeeForm, setEmployeeForm] = useState(initialEmployeeForm);
    
    const initialPaymentForm: Omit<SalaryPayment, 'id'> = { employeeId: '', date: new Date().toISOString().slice(0,10), amount: 0, type: SalaryPaymentType.SALARY, notes: '' };
    const [paymentForm, setPaymentForm] = useState(initialPaymentForm);

    const [filters, setFilters] = useState({ employeeId: 'all', dateFrom: '', dateTo: '' });

    const handleOpenEmployeeModal = (employee?: Employee) => {
        setSelectedEmployee(employee || null);
        setEmployeeForm(employee || initialEmployeeForm);
        setIsEmployeeModalOpen(true);
    };

    const handleCloseEmployeeModal = () => {
        setIsEmployeeModalOpen(false);
        setSelectedEmployee(null);
        setEmployeeForm(initialEmployeeForm);
    };
    
    const handleOpenPaymentModal = () => setIsPaymentModalOpen(true);
    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setPaymentForm(initialPaymentForm);
    }
    
    const handleEmployeeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedEmployee) {
                updateEmployee({ ...employeeForm, id: selectedEmployee.id });
                addToast({ message: 'Employee updated successfully!', type: 'success' });
            } else {
                addEmployee(employeeForm);
                addToast({ message: 'Employee added successfully!', type: 'success' });
            }
            handleCloseEmployeeModal();
        } catch (error) {
            addToast({ message: 'Failed to save employee.', type: 'error' });
        }
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!paymentForm.employeeId) {
            addToast({ message: 'Please select an employee.', type: 'error' });
            return;
        }
        try {
            addSalaryPayment(paymentForm);
            addToast({ message: 'Payment recorded successfully!', type: 'success' });
            handleClosePaymentModal();
        } catch (error) {
             addToast({ message: 'Failed to record payment.', type: 'error' });
        }
    }
    
    const handleDeleteClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDeleteConfirmOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (selectedEmployee) {
            deleteEmployee(selectedEmployee.id);
            addToast({ message: `Employee "${selectedEmployee.name}" deleted.`, type: 'success' });
        }
        setIsDeleteConfirmOpen(false);
        setSelectedEmployee(null);
    };
    
    const employeeMap = useMemo(() => {
        return employees.reduce((acc, emp) => {
            acc[emp.id] = emp.name;
            return acc;
        }, {} as Record<string, string>);
    }, [employees]);

    const filteredPayments = useMemo(() => {
        return salaryPayments.filter(p => {
             const employeeFilter = filters.employeeId === 'all' || p.employeeId === filters.employeeId;
             const date = new Date(p.date);
             const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
             const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
             if(dateFrom) dateFrom.setHours(0,0,0,0);
             if(dateTo) dateTo.setHours(23,59,59,999);
             const dateFilter = (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
             return employeeFilter && dateFilter;
        });
    }, [salaryPayments, filters]);

    const handleExport = () => {
        const data = filteredPayments.map(p => ({
            "Date": new Date(p.date).toLocaleDateString(),
            "Employee": employeeMap[p.employeeId] || 'N/A',
            "Type": p.type,
            "Amount": p.amount,
            "Notes": p.notes || ''
        }));
        exportToCsv(`SalaryRecords_${new Date().toISOString().slice(0,10)}.csv`, data);
    }

    if (loading) return <Spinner />;

    const inputClasses = "w-full bg-card border border-border-color rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all";
    const tabButtonClasses = (isActive: boolean) => `px-6 py-3 font-semibold ${isActive ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`;

    return (
        <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md">
            <h2 className="text-2xl font-poppins font-semibold mb-6">Salary Management</h2>

            <div className="flex border-b border-border-color mb-6">
                <button onClick={() => setActiveTab('employees')} className={tabButtonClasses(activeTab === 'employees')}>Employees</button>
                <button onClick={() => setActiveTab('records')} className={tabButtonClasses(activeTab === 'records')}>Salary Records</button>
            </div>

            {activeTab === 'employees' && (
                <div>
                    <div className="flex justify-end mb-6">
                        <button onClick={() => handleOpenEmployeeModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-300 shadow-primary">
                            Add Employee
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           {/* ... Employee table ... */}
                           <thead className="border-b border-border-color">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3">Monthly Salary</th>
                                    <th className="p-3">Phone</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => (
                                     <tr key={emp.id} className="border-b border-border-color hover:bg-card">
                                        <td className="p-3">{emp.name}</td>
                                        <td className="p-3">{emp.role}</td>
                                        <td className="p-3">{formatCurrency(emp.monthlySalary)}</td>
                                        <td className="p-3">{emp.phone}</td>
                                        <td className="p-3 text-right space-x-2">
                                            <button onClick={() => handleOpenEmployeeModal(emp)} className="bg-secondary/20 text-secondary px-3 py-1 rounded-md text-sm hover:bg-secondary/40">Edit</button>
                                            <button onClick={() => handleDeleteClick(emp)} className="bg-danger/20 text-danger px-3 py-1 rounded-md text-sm hover:bg-danger/40">Delete</button>
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
                           Pay Salary / Advance
                        </button>
                        <button onClick={handleExport} className="flex items-center gap-2 bg-secondary/20 text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-secondary/40 transition-all duration-300">
                           <Icon name="download" className="w-5 h-5"/> Export to Excel
                        </button>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <select name="employeeId" value={filters.employeeId} onChange={(e) => setFilters(prev => ({...prev, employeeId: e.target.value}))} className={inputClasses}>
                            <option value="all">All Employees</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                         <div className="flex items-center gap-2 col-span-2">
                             <input name="dateFrom" type="date" value={filters.dateFrom} onChange={(e) => setFilters(prev => ({...prev, dateFrom: e.target.value}))} className={inputClasses} title="Start Date"/>
                             <input name="dateTo" type="date" value={filters.dateTo} onChange={(e) => setFilters(prev => ({...prev, dateTo: e.target.value}))} className={inputClasses} title="End Date"/>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                         <table className="w-full text-left">
                            <thead className="border-b border-border-color">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Employee</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                               {filteredPayments.map(p => (
                                     <tr key={p.id} className="border-b border-border-color hover:bg-card">
                                        <td className="p-3">{new Date(p.date).toLocaleDateString()}</td>
                                        <td className="p-3">{employeeMap[p.employeeId] || 'N/A'}</td>
                                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${p.type === SalaryPaymentType.SALARY ? 'bg-success/20 text-success' : 'bg-accent/20 text-accent'}`}>{p.type}</span></td>
                                        <td className="p-3">{formatCurrency(p.amount)}</td>
                                        <td className="p-3">{p.notes}</td>
                                    </tr>
                               ))}
                            </tbody>
                        </table>
                        {filteredPayments.length === 0 && <div className="text-center py-10 text-text-secondary">No salary records match filters.</div>}
                    </div>
                </div>
            )}
            
            {/* Modals */}
             <Modal isOpen={isEmployeeModalOpen} onClose={handleCloseEmployeeModal} title={selectedEmployee ? 'Edit Employee' : 'Add Employee'}>
                <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                    <input name="name" value={employeeForm.name} onChange={e => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Employee Name" className={inputClasses} required />
                    <input name="role" value={employeeForm.role} onChange={e => setEmployeeForm(prev => ({ ...prev, role: e.target.value }))} placeholder="Role" className={inputClasses} required />
                    <input name="monthlySalary" type="number" value={employeeForm.monthlySalary} onChange={e => setEmployeeForm(prev => ({ ...prev, monthlySalary: parseFloat(e.target.value) || 0 }))} placeholder="Monthly Salary" className={inputClasses} required />
                    <input name="phone" value={employeeForm.phone} onChange={e => setEmployeeForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone Number" className={inputClasses} required />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={handleCloseEmployeeModal} className="bg-card text-text-primary px-6 py-2 rounded-lg hover:opacity-80">Cancel</button>
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 shadow-primary">Save Employee</button>
                    </div>
                </form>
            </Modal>
            <Modal isOpen={isPaymentModalOpen} onClose={handleClosePaymentModal} title="Pay Salary / Advance">
                 <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <select name="employeeId" value={paymentForm.employeeId} onChange={e => setPaymentForm(p => ({...p, employeeId: e.target.value}))} className={inputClasses}>
                        <option value="">Select Employee</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                    <select name="type" value={paymentForm.type} onChange={e => setPaymentForm(p => ({...p, type: e.target.value as SalaryPaymentType}))} className={inputClasses}>
                        <option value={SalaryPaymentType.SALARY}>Salary</option>
                        <option value={SalaryPaymentType.ADVANCE}>Advance</option>
                    </select>
                    <input name="amount" type="number" value={paymentForm.amount} onChange={e => setPaymentForm(p => ({...p, amount: parseFloat(e.target.value) || 0}))} placeholder="Amount" className={inputClasses} required />
                    <input name="date" type="date" value={paymentForm.date} onChange={e => setPaymentForm(p => ({...p, date: e.target.value}))} className={inputClasses} required />
                    <input name="notes" value={paymentForm.notes} onChange={e => setPaymentForm(p => ({...p, notes: e.target.value}))} placeholder="Notes (Optional)" className={inputClasses} />
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
                title="Delete Employee"
                message={`Are you sure you want to delete "${selectedEmployee?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default SalaryManagement;