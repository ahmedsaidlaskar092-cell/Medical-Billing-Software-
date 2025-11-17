
import React, { useState, useMemo, useEffect } from 'react';
import useMockData from '../../hooks/useMockData';
import { Product } from '../../types';
import Spinner from '../ui/Spinner';
import { formatCurrency } from '../../services/utils';
import Modal from '../ui/Modal';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import { useToast } from '../../hooks/useToast';

const ProductManagement: React.FC = () => {
    const { products, loading, addProduct, updateProduct, deleteProduct } = useMockData();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const initialFormState: Omit<Product, 'id'> = {
        name: '',
        category: '',
        price: 0,
        stock: 0,
        isService: false,
    };
    const [productForm, setProductForm] = useState(initialFormState);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [products, debouncedSearchTerm]);

    const handleOpenModal = (product?: Product) => {
        setSelectedProduct(product || null);
        setProductForm(product || initialFormState);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setProductForm(initialFormState);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             const checked = (e.target as HTMLInputElement).checked;
             setProductForm(prev => ({ ...prev, isService: checked, stock: checked ? 0 : prev.stock }));
        } else {
             setProductForm(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedProduct) {
                updateProduct({ ...productForm, id: selectedProduct.id });
                addToast({ message: 'Product updated successfully!', type: 'success' });
            } else {
                addProduct(productForm);
                addToast({ message: 'Product added successfully!', type: 'success' });
            }
            handleCloseModal();
        } catch (error) {
            addToast({ message: 'An unexpected error occurred.', type: 'error' });
        }
    };
    
    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteConfirmOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (selectedProduct) {
            deleteProduct(selectedProduct.id);
            addToast({ message: `Product "${selectedProduct.name}" deleted.`, type: 'success' });
        }
        setIsDeleteConfirmOpen(false);
        setSelectedProduct(null);
    };

    if (loading) return <Spinner />;

    const inputClasses = "w-full bg-card border border-border-color rounded-lg px-4 py-2 text-text-primary";

    return (
        <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-poppins font-semibold">Product Management</h2>
                <button onClick={() => handleOpenModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-300 shadow-primary">
                    Add Product
                </button>
            </div>
            
            <input 
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputClasses} mb-6 max-w-sm`}
            />

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-border-color">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="border-b border-border-color hover:bg-card">
                                <td className="p-3">{product.name}</td>
                                <td className="p-3">{product.category}</td>
                                <td className="p-3">{formatCurrency(product.price)}</td>
                                <td className="p-3">{product.isService ? 'N/A' : product.stock}</td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => handleOpenModal(product)} className="bg-secondary/20 text-secondary px-3 py-1 rounded-md text-sm hover:bg-secondary/40">Edit</button>
                                    <button onClick={() => handleDeleteClick(product)} className="bg-danger/20 text-danger px-3 py-1 rounded-md text-sm hover:bg-danger/40">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredProducts.length === 0 && (
                    <div className="text-center py-10 text-text-secondary">No products found.</div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedProduct ? 'Edit Product' : 'Add New Product'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={productForm.name} onChange={handleFormChange} placeholder="Product Name" className={inputClasses} required />
                    <input name="category" value={productForm.category} onChange={handleFormChange} placeholder="Category" className={inputClasses} required />
                    <input name="price" type="number" value={productForm.price} onChange={handleFormChange} placeholder="Price" className={inputClasses} required />
                    <input name="stock" type="number" value={productForm.stock} onChange={handleFormChange} placeholder="Stock" className={inputClasses} disabled={productForm.isService} />
                    <div className="flex items-center gap-2">
                         <input id="isService" name="isService" type="checkbox" checked={productForm.isService} onChange={handleFormChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                         <label htmlFor="isService" className="text-text-secondary">This is a service (no stock tracking)</label>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                         <button type="button" onClick={handleCloseModal} className="bg-card text-text-primary px-6 py-2 rounded-lg hover:opacity-80">Cancel</button>
                         <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 shadow-primary">Save Product</button>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationDialog 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
            />

        </div>
    );
};

export default ProductManagement;