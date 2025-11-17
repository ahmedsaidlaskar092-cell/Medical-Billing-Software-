import { useState, useEffect } from 'react';
import { Bill, Product, Test, Due, Settings, Employee, SalaryPayment, DailyExpense, Party, PartyPayment } from '../types';
// FIX: Added all newly exported mock data variables to resolve import errors.
import { mockBills, mockProducts, mockTests, mockDues, mockSettings, mockEmployees, mockSalaryPayments, mockDailyExpenses, mockParties, mockPartyPayments } from '../services/mockData';

const useMockData = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [tests, setTests] = useState<Test[]>([]);
    const [dues, setDues] = useState<Due[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
    const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);
    const [parties, setParties] = useState<Party[]>([]);
    const [partyPayments, setPartyPayments] = useState<PartyPayment[]>([]);
    const [settings, setSettings] = useState<Settings>(mockSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate initial data fetch
        const timer = setTimeout(() => {
            setBills(mockBills);
            setProducts(mockProducts);
            setTests(mockTests);
            setDues(mockDues);
            setEmployees(mockEmployees);
            setSalaryPayments(mockSalaryPayments);
            setDailyExpenses(mockDailyExpenses);
            setParties(mockParties);
            setPartyPayments(mockPartyPayments);
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);
    
    const addBill = (newBill: Bill) => {
        setBills(prev => [newBill, ...prev]);
        if (newBill.dueAmount > 0) {
            const newDue: Due = {
                id: `due-${Date.now()}`,
                billId: newBill.id,
                customerName: newBill.patient?.name || newBill.customerName || 'N/A',
                customerPhone: newBill.patient?.phone || '',
                totalDue: newBill.dueAmount
            };
            setDues(prev => [newDue, ...prev]);
        }
    };

    // Product CRUD
    const addProduct = (productData: Omit<Product, 'id'>) => {
        const newProduct: Product = { ...productData, id: `prod-${Date.now()}` };
        setProducts(prev => [newProduct, ...prev]);
    };

    const updateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const deleteProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    // Test CRUD
    const addTest = (testData: Omit<Test, 'id'>) => {
        const newTest: Test = { ...testData, id: `test-${Date.now()}` };
        setTests(prev => [newTest, ...prev]);
    };
    
    const updateTest = (updatedTest: Test) => {
        setTests(prev => prev.map(t => t.id === updatedTest.id ? updatedTest : t));
    };

    const deleteTest = (testId: string) => {
        setTests(prev => prev.filter(t => t.id !== testId));
    };

    // Employee CRUD
    const addEmployee = (employeeData: Omit<Employee, 'id'>) => {
        const newEmployee: Employee = { ...employeeData, id: `emp-${Date.now()}` };
        setEmployees(prev => [newEmployee, ...prev]);
    };

    const updateEmployee = (updatedEmployee: Employee) => {
        setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    };

    const deleteEmployee = (employeeId: string) => {
        setEmployees(prev => prev.filter(e => e.id !== employeeId));
    };

    // Salary Payment CRUD
    const addSalaryPayment = (paymentData: Omit<SalaryPayment, 'id'>) => {
        const newPayment: SalaryPayment = { ...paymentData, id: `sal-${Date.now()}` };
        setSalaryPayments(prev => [newPayment, ...prev]);
    };

    // Daily Expense CRUD
    const addDailyExpense = (expenseData: Omit<DailyExpense, 'id'>) => {
        const newExpense: DailyExpense = { ...expenseData, id: `exp-${Date.now()}` };
        setDailyExpenses(prev => [newExpense, ...prev]);
    };

    const updateDailyExpense = (updatedExpense: DailyExpense) => {
        setDailyExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    };

    const deleteDailyExpense = (expenseId: string) => {
        setDailyExpenses(prev => prev.filter(e => e.id !== expenseId));
    };

    // Party CRUD
    const addParty = (partyData: Omit<Party, 'id'>) => {
        const newParty: Party = { ...partyData, id: `party-${Date.now()}` };
        setParties(prev => [newParty, ...prev]);
    };

    const updateParty = (updatedParty: Party) => {
        setParties(prev => prev.map(p => p.id === updatedParty.id ? updatedParty : p));
    };

    const deleteParty = (partyId: string) => {
        setParties(prev => prev.filter(p => p.id !== partyId));
    };

    // Party Payment CRUD
    const addPartyPayment = (paymentData: Omit<PartyPayment, 'id'>) => {
        const newPayment: PartyPayment = { ...paymentData, id: `pp-${Date.now()}` };
        setPartyPayments(prev => [newPayment, ...prev]);
    };

    return { 
        bills, 
        products, 
        tests, 
        dues, 
        settings, 
        employees,
        salaryPayments,
        dailyExpenses,
        parties,
        partyPayments,
        loading, 
        addBill, 
        setSettings,
        addProduct,
        updateProduct,
        deleteProduct,
        addTest,
        updateTest,
        deleteTest,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addSalaryPayment,
        addDailyExpense,
        updateDailyExpense,
        deleteDailyExpense,
        addParty,
        updateParty,
        deleteParty,
        addPartyPayment,
    };
};

export default useMockData;