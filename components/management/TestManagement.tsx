import React, { useState, useMemo, useEffect } from 'react';
import useMockData from '../../hooks/useMockData';
import { Test } from '../../types';
import Spinner from '../ui/Spinner';
import { formatCurrency } from '../../services/utils';
import Modal from '../ui/Modal';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import Icon from '../ui/Icon';
import { useToast } from '../../hooks/useToast';

type SortDirection = 'ascending' | 'descending';
type SortConfig = {
    key: keyof Test;
    direction: SortDirection;
};

const ITEMS_PER_PAGE = 15;

const TestManagement: React.FC = () => {
    const { tests, loading, addTest, updateTest, deleteTest } = useMockData();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);

    const initialFormState: Omit<Test, 'id'> = {
        name: '',
        code: '',
        department: '',
        mrp: 0,
    };
    const [testForm, setTestForm] = useState(initialFormState);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset to first page on new search
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const filteredTests = useMemo(() => {
        return tests.filter(t => 
            t.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            t.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            t.department.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [tests, debouncedSearchTerm]);
    
    const sortedAndPaginatedTests = useMemo(() => {
        let sortableItems = [...filteredTests];
        sortableItems.sort((a, b) => {
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];
            
            if (typeof valA === 'string' && typeof valB === 'string') {
                 return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return sortableItems.slice(startIndex, endIndex);

    }, [filteredTests, currentPage, sortConfig]);

    const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);

    const requestSort = (key: keyof Test) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const handleOpenModal = (test?: Test) => {
        setSelectedTest(test || null);
        setTestForm(test || initialFormState);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTest(null);
        setTestForm(initialFormState);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setTestForm(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const isDuplicate = tests.some(
                t => t.code.toLowerCase() === testForm.code.toLowerCase() && t.id !== selectedTest?.id
            );
            if (isDuplicate) {
                addToast({ message: `A test with code "${testForm.code}" already exists.`, type: 'error'});
                return;
            }
            if (testForm.mrp < 0) {
                addToast({ message: "MRP cannot be negative.", type: 'error'});
                return;
            }

            if (selectedTest) {
                updateTest({ ...testForm, id: selectedTest.id });
                addToast({ message: 'Test updated successfully!', type: 'success' });
            } else {
                addTest(testForm);
                addToast({ message: 'Test added successfully!', type: 'success' });
            }
            handleCloseModal();
        } catch (error) {
            addToast({ message: 'An unexpected error occurred.', type: 'error' });
        }
    };
    
    const handleDeleteClick = (test: Test) => {
        setSelectedTest(test);
        setIsDeleteConfirmOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (selectedTest) {
            deleteTest(selectedTest.id);
            addToast({ message: `Test "${selectedTest.name}" deleted.`, type: 'success' });
        }
        setIsDeleteConfirmOpen(false);
        setSelectedTest(null);
    };
    
    const SortableHeader: React.FC<{ columnKey: keyof Test; title: string }> = ({ columnKey, title }) => (
        <th className="p-3">
            <button onClick={() => requestSort(columnKey)} className="flex items-center gap-1 font-semibold text-text-secondary hover:text-text-primary transition-colors">
                <span>{title}</span>
                <div className="w-4 h-4"> {/* Placeholder to prevent layout shift */}
                    {sortConfig.key === columnKey && (
                        <Icon name={sortConfig.direction === 'ascending' ? 'arrow-up' : 'arrow-down'} className="w-4 h-4" />
                    )}
                </div>
            </button>
        </th>
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;
    
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const halfPages = Math.floor(maxPagesToShow / 2);
        let startPage = Math.max(currentPage - halfPages, 1);
        let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);
    
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(endPage - maxPagesToShow + 1, 1);
        }
        
        if (startPage > 1) {
            pageNumbers.push(<button key={1} onClick={() => setCurrentPage(1)} className="px-3 py-1 rounded-lg bg-card hover:bg-primary/20">1</button>);
            if (startPage > 2) {
                pageNumbers.push(<span key="start-ellipsis" className="px-3 py-1">...</span>);
            }
        }
    
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 rounded-lg ${currentPage === i ? 'bg-primary text-white shadow-primary' : 'bg-card hover:bg-primary/20'}`}
                >
                    {i}
                </button>
            );
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                 pageNumbers.push(<span key="end-ellipsis" className="px-3 py-1">...</span>);
            }
            pageNumbers.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="px-3 py-1 rounded-lg bg-card hover:bg-primary/20">{totalPages}</button>);
        }
    
        return (
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
                <span className="text-sm text-text-secondary">
                    Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredTests.length)}
                    - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTests.length)} of {filteredTests.length} tests
                </span>
                <div className="flex gap-2 items-center flex-wrap">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-lg bg-card hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    {pageNumbers}
                     <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-lg bg-card hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                       Next
                    </button>
                </div>
            </div>
        );
    };

    if (loading) return <Spinner />;

    const inputClasses = "w-full bg-card border border-border-color rounded-lg px-4 py-2 text-text-primary";

    return (
        <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-poppins font-semibold">Test Management</h2>
                <button onClick={() => handleOpenModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-300 shadow-primary">
                    Add Test
                </button>
            </div>

            <input 
                type="text"
                placeholder="Search by name, code, or department..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClasses} mb-6 max-w-sm`}
            />
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-border-color">
                        <tr>
                            <SortableHeader columnKey="name" title="Name" />
                            <SortableHeader columnKey="code" title="Code" />
                            <SortableHeader columnKey="department" title="Department" />
                            <SortableHeader columnKey="mrp" title="MRP" />
                            <th className="p-3 text-right font-semibold text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                         {sortedAndPaginatedTests.length > 0 ? (
                            sortedAndPaginatedTests.map(test => (
                                <tr key={test.id} className="border-b border-border-color hover:bg-card">
                                    <td className="p-3 break-words max-w-sm">{test.name}</td>
                                    <td className="p-3">{test.code}</td>
                                    <td className="p-3">{test.department}</td>
                                    <td className="p-3">{formatCurrency(test.mrp)}</td>
                                    <td className="p-3 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(test)} className="bg-secondary/20 text-secondary px-3 py-1 rounded-md text-sm hover:bg-secondary/40">Edit</button>
                                        <button onClick={() => handleDeleteClick(test)} className="bg-danger/20 text-danger px-3 py-1 rounded-md text-sm hover:bg-danger/40">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5}>
                                     <div className="text-center py-16 text-text-secondary">
                                        <div className="inline-block p-4 rounded-full bg-card mb-4">
                                            <Icon name="tests" className="w-12 h-12 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-text-primary">No Tests Found</h3>
                                        {debouncedSearchTerm ? (
                                            <p>Your search for "{debouncedSearchTerm}" did not match any tests.</p>
                                        ) : (
                                            <p>Get started by adding a new test.</p>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {renderPagination()}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedTest ? 'Edit Test' : 'Add New Test'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={testForm.name} onChange={handleFormChange} placeholder="Test Name" className={inputClasses} required />
                    <input name="code" value={testForm.code} onChange={handleFormChange} placeholder="Test Code" className={inputClasses} required />
                    <input name="department" value={testForm.department} onChange={handleFormChange} placeholder="Department" className={inputClasses} required />
                    <input name="mrp" type="number" step="0.01" value={testForm.mrp} onChange={handleFormChange} placeholder="MRP" className={inputClasses} required />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={handleCloseModal} className="bg-card text-text-primary px-6 py-2 rounded-lg hover:opacity-80">Cancel</button>
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 shadow-primary">Save Test</button>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationDialog 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Test"
                message={`Are you sure you want to delete "${selectedTest?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default TestManagement;