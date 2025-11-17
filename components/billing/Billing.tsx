import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as reactToPrint from 'react-to-print';
import { BillType, Product, Test, BillItem, Patient, Gender, PaymentMode, ReportStatus, Bill, Payment } from '../../types';
import useMockData from '../../hooks/useMockData';
import { numberToWordsIndian, formatCurrency } from '../../services/utils';
import PrintModal from '../print/PrintModal';
import Icon from '../ui/Icon';
import A4Bill from '../print/A4Bill';
import { mockSettings } from '../../services/mockData';
import { useToast } from '../../hooks/useToast';

const useReactToPrint = (reactToPrint as any)?.default?.useReactToPrint || (reactToPrint as any)?.useReactToPrint;

const Billing: React.FC = () => {
    const [billType, setBillType] = useState<BillType>(BillType.MEDICAL);
    const [items, setItems] = useState<BillItem[]>([]);
    const [patient, setPatient] = useState<Partial<Patient>>({});
    const [customerName, setCustomerName] = useState('');
    const [discount, setDiscount] = useState(0);
    const [payments, setPayments] = useState<Payment[]>([{ mode: PaymentMode.CASH, amount: 0 }]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const { products, tests, addBill } = useMockData();
    const { addToast } = useToast();
    const [searchResults, setSearchResults] = useState<(Product | Test)[]>([]);

    const [showPrintModal, setShowPrintModal] = useState(false);
    const [lastGeneratedBill, setLastGeneratedBill] = useState<Bill | null>(null);

    const a4PrintRef = useRef(null);
    const handleDownload = useReactToPrint ? useReactToPrint({
        content: () => a4PrintRef.current,
        documentTitle: `Invoice-${lastGeneratedBill?.billNo}`,
    }) : () => addToast({ message: 'Print service failed to load.', type: 'error' });


    const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.price * item.quantity, 0), [items]);
    const grandTotal = useMemo(() => subtotal - discount, [subtotal, discount]);
    const paidAmount = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);
    const dueAmount = useMemo(() => grandTotal - paidAmount, [grandTotal, paidAmount]);

    useEffect(() => {
        if (payments.length === 1 && !lastGeneratedBill) {
            setPayments([{ ...payments[0], amount: grandTotal > 0 ? grandTotal : 0 }]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grandTotal, lastGeneratedBill]);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        if (term.length < 1) {
            setSearchResults([]);
            return;
        }
        const lowerCaseTerm = term.toLowerCase();
        if (billType === BillType.MEDICAL) {
            setSearchResults(tests.filter(t => t.name.toLowerCase().includes(lowerCaseTerm) || t.code.toLowerCase().includes(lowerCaseTerm)));
        } else {
            setSearchResults(products.filter(p => p.name.toLowerCase().includes(lowerCaseTerm)));
        }
    }, [billType, products, tests]);

    const addItem = (item: Product | Test) => {
        const existingItem = items.find(i => i.id === item.id);
        if (billType === BillType.RETAIL && !existingItem) {
            setItems([...items, { id: item.id, name: item.name, price: (item as Product).price, quantity: 1 }]);
        } else if (billType === BillType.MEDICAL && !existingItem) {
            setItems([...items, { id: item.id, name: item.name, price: (item as Test).mrp, quantity: 1 }]);
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setItems(items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };
    
    const resetBill = useCallback(() => {
        setItems([]);
        setPatient({});
        setCustomerName('');
        setDiscount(0);
        setPayments([{ mode: PaymentMode.CASH, amount: 0 }]);
        setSearchTerm('');
    }, []);

    const createNewBill = () => {
        resetBill();
        setLastGeneratedBill(null);
    };
    
    const handlePaymentChange = (index: number, field: 'mode' | 'amount', value: string | number) => {
        const newPayments = [...payments];
        if (field === 'mode') {
            newPayments[index].mode = value as PaymentMode;
        } else {
            newPayments[index].amount = parseFloat(value as string) || 0;
        }
        setPayments(newPayments);
    };

    const addPaymentMethod = () => {
        const remainingAmount = grandTotal - paidAmount;
        setPayments([...payments, { mode: PaymentMode.UPI, amount: remainingAmount > 0 ? remainingAmount : 0 }]);
    };

    const removePaymentMethod = (index: number) => {
        if (payments.length > 1) {
            const newPayments = payments.filter((_, i) => i !== index);
            setPayments(newPayments);
        }
    };
    
    const handleShareWhatsApp = () => {
        if (!lastGeneratedBill) return;
        const phone = lastGeneratedBill.patient?.phone || '';
        if (!phone) {
            addToast({ message: "No phone number available to share.", type: 'error' });
            return;
        }
        const textBillContent = new TextBillGenerator(lastGeneratedBill, mockSettings).generate();
        const encodedText = encodeURIComponent(textBillContent);
        window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
    };

    const handleSaveAndPrint = () => {
        if(items.length === 0) {
            addToast({ message: 'Please add items to the bill.', type: 'error'});
            return;
        }
        if(billType === BillType.MEDICAL && !patient.name) {
             addToast({ message: 'Patient name is required for medical bills.', type: 'error'});
             return;
        }

        try {
            const newBill: Bill = {
                id: `bill-${Date.now()}`,
                billNo: `B${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Date.now()).slice(-3)}`,
                date: new Date().toISOString(),
                time: new Date().toLocaleTimeString(),
                billType,
                items,
                subtotal,
                discount,
                grandTotal,
                paidAmount,
                dueAmount,
                payments,
                ...(billType === BillType.MEDICAL && { patient: patient as Patient, reportStatus: ReportStatus.NOT_DELIVERED }),
                ...(billType === BillType.RETAIL && { customerName }),
            };
            
            addBill(newBill);
            setLastGeneratedBill(newBill);
            addToast({ message: 'Bill generated successfully!', type: 'success' });
            resetBill();
        } catch (error) {
            addToast({ message: 'Failed to generate bill.', type: 'error' });
        }
    };

    const inputClasses = "w-full bg-card border border-border-color rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all";

    const renderMedicalForm = () => (
        <div className="p-6 border border-border-color rounded-xl mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Patient Name" value={patient.name || ''} onChange={e => setPatient(p => ({ ...p, name: e.target.value }))} className={inputClasses} required />
                <input type="number" placeholder="Age" value={patient.age || ''} onChange={e => setPatient(p => ({ ...p, age: parseInt(e.target.value) || undefined }))} className={inputClasses} />
                <select value={patient.gender || ''} onChange={e => setPatient(p => ({...p, gender: e.target.value as Gender}))} className={inputClasses}>
                    <option value="">Select Gender</option>
                    {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <input type="tel" placeholder="Phone" value={patient.phone || ''} onChange={e => setPatient(p => ({...p, phone: e.target.value}))} className={inputClasses} />
                <input type="text" placeholder="Referred By (Doctor)" value={patient.referredBy || ''} onChange={e => setPatient(p => ({ ...p, referredBy: e.target.value }))} className={`md:col-span-2 ${inputClasses}`} />
            </div>
        </div>
    );
    
    const renderRetailForm = () => (
        <div className="p-6 border border-border-color rounded-xl mb-6">
            <input type="text" placeholder="Customer Name (Optional)" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`w-full md:w-1/2 ${inputClasses}`} />
        </div>
    );
    
    const actionButtonClasses = "w-full flex items-center justify-center gap-2 text-center bg-card border border-border-color rounded-lg px-4 py-3 font-semibold transition-all hover:border-primary hover:text-primary";

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Left Side - Billing Form */}
            <div className="lg:w-2/3 bg-card border border-border-color rounded-xl p-6 backdrop-blur-md flex flex-col">
                <div className="flex border-b border-border-color mb-6">
                    <button onClick={() => { setBillType(BillType.MEDICAL); createNewBill(); }} className={`px-6 py-3 font-semibold ${billType === BillType.MEDICAL ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>Medical Billing</button>
                    <button onClick={() => { setBillType(BillType.RETAIL); createNewBill(); }} className={`px-6 py-3 font-semibold ${billType === BillType.RETAIL ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>Retail Billing</button>
                </div>

                {!lastGeneratedBill && (
                    <>
                        {billType === BillType.MEDICAL ? renderMedicalForm() : renderRetailForm()}
                        
                        <div className="relative mb-4">
                            <input type="text" placeholder={`Search ${billType === BillType.MEDICAL ? 'Test' : 'Product'}...`} value={searchTerm} onChange={e => handleSearch(e.target.value)} className={`w-full ${inputClasses}`} />
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-background border border-border-color rounded-lg mt-1 z-10 max-h-60 overflow-y-auto">
                                    {searchResults.map(item => (
                                        <div key={item.id} onClick={() => addItem(item)} className="p-3 hover:bg-primary/20 cursor-pointer">
                                            {item.name} - {formatCurrency(billType === BillType.MEDICAL ? (item as Test).mrp : (item as Product).price)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Items Table */}
                        <div className="flex-grow overflow-y-auto -mx-6 px-6">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-card">
                                    <tr className="border-b border-border-color">
                                        <th className="p-3 font-semibold text-text-secondary w-2/5">Item</th>
                                        <th className="p-3 font-semibold text-text-secondary text-center">Qty</th>
                                        <th className="p-3 font-semibold text-text-secondary text-right">Price</th>
                                        <th className="p-3 font-semibold text-text-secondary text-right">Total</th>
                                        <th className="p-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center text-text-secondary py-10">No items added to the bill.</td></tr>
                                    ) : (
                                        items.map(item => (
                                            <tr key={item.id} className="border-b border-border-color">
                                                <td className="p-3">{item.name}</td>
                                                <td className="p-3 text-center">
                                                    {billType === BillType.RETAIL ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 rounded bg-background hover:bg-primary/20">-</button>
                                                            <span>{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 rounded bg-background hover:bg-primary/20">+</button>
                                                        </div>
                                                    ) : <span>1</span>}
                                                </td>
                                                <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                                                <td className="p-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                                                <td className="p-3 text-center">
                                                    <button onClick={() => removeItem(item.id)} className="text-danger hover:opacity-75">
                                                        <Icon name="close" className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                 {lastGeneratedBill && (
                    <div className="flex-grow flex flex-col items-center justify-center text-center animate-fadeIn">
                        <div className="bg-success/20 border border-success text-success p-4 rounded-full mb-6">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-poppins font-semibold mb-2">Bill Generated Successfully!</h2>
                        <p className="text-text-secondary mb-6">Bill No: <span className="font-semibold text-text-primary">{lastGeneratedBill.billNo}</span></p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-2xl mx-auto mb-6">
                            <button onClick={handleDownload} className={actionButtonClasses}>Download Bill</button>
                            <button onClick={() => setShowPrintModal(true)} className={actionButtonClasses}>Print Bill</button>
                            <button onClick={handleShareWhatsApp} disabled={!lastGeneratedBill.patient?.phone} className={`${actionButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}>Share on WhatsApp</button>
                        </div>
                        <button onClick={createNewBill} className="w-full max-w-2xl mx-auto bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all duration-300 shadow-primary">
                            Create New Bill
                        </button>
                    </div>
                )}
            </div>

            {/* Right Side - Summary */}
            <div className={`lg:w-1/3 bg-card border border-border-color rounded-xl p-6 backdrop-blur-md flex flex-col gap-4 ${lastGeneratedBill ? 'hidden lg:flex' : 'flex'}`}>
                 <h3 className="text-2xl font-poppins font-semibold border-b border-border-color pb-4">Bill Summary</h3>
                <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Discount (₹)</span>
                    <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className={`w-24 text-right ${inputClasses}`} />
                </div>
                <div className="border-t border-border-color my-2"></div>
                <div className="flex justify-between text-xl font-bold"><span >Grand Total</span><span>{formatCurrency(grandTotal)}</span></div>
                
                <div className="space-y-3 border-t border-border-color pt-4">
                    <span className="text-text-secondary block font-semibold">Payments</span>
                    {payments.map((payment, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <select value={payment.mode} onChange={e => handlePaymentChange(index, 'mode', e.target.value)} className={`w-1/3 ${inputClasses}`}>
                                {Object.values(PaymentMode).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <input type="number" value={payment.amount} onChange={e => handlePaymentChange(index, 'amount', e.target.value)} className={`flex-grow font-semibold text-right ${inputClasses}`} />
                            <button onClick={() => removePaymentMethod(index)} disabled={payments.length <= 1} className="text-danger disabled:opacity-50">
                                <Icon name="close" className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                    <button onClick={addPaymentMethod} className="text-sm text-primary hover:underline">+ Add another payment method</button>
                </div>
                
                <div className="flex justify-between font-semibold text-success"><span>Total Paid</span><span>{formatCurrency(paidAmount)}</span></div>
                <div className={`flex justify-between font-bold ${dueAmount >= 0 ? 'text-danger' : 'text-success'}`}><span>{dueAmount >= 0 ? 'Due Amount' : 'Change'}</span><span>{formatCurrency(Math.abs(dueAmount))}</span></div>
                <div className="text-xs text-text-secondary mt-2"><p className="font-semibold">Amount in Words:</p><p>{numberToWordsIndian(grandTotal)}</p></div>
                
                <div className="mt-auto pt-4">
                    <button onClick={handleSaveAndPrint} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all duration-300 shadow-primary disabled:opacity-50" disabled={items.length === 0}>
                        Generate Bill
                    </button>
                </div>
            </div>

            {showPrintModal && lastGeneratedBill && (
                <PrintModal bill={lastGeneratedBill} onClose={() => setShowPrintModal(false)} />
            )}
            
            {/* Hidden component for direct PDF download */}
            {lastGeneratedBill && (
                <div className="hidden"><A4Bill ref={a4PrintRef} bill={lastGeneratedBill} settings={mockSettings} /></div>
            )}
        </div>
    );
};

// Helper class to generate text bill content
class TextBillGenerator {
    private bill: Bill;
    private settings: typeof mockSettings;
    
    constructor(bill: Bill, settings: typeof mockSettings) {
        this.bill = bill;
        this.settings = settings;
    }

    generate(): string {
        const horizontalLine = '══════════════════════════════════════';
        const thinLine = '———————————————————————';

        const itemsText = this.bill.items.map(item =>
            `• ${item.name} (x${item.quantity})  ₹${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');

        const patientDetails = this.bill.billType === BillType.MEDICAL ? `
👤 PATIENT DETAILS
Name: ${this.bill.patient?.name}
Age/Gender: ${this.bill.patient?.age}/${this.bill.patient?.gender}
Phone: ${this.bill.patient?.phone}
Doctor: ${this.bill.patient?.referredBy}
` : '';

        const paymentsText = this.bill.payments.map(p => `${p.mode}: ₹${p.amount.toFixed(2)}`).join(', ');

        return `
${horizontalLine}
           ${this.settings.shopName}
${horizontalLine}
Address: ${this.settings.address}
Phone: ${this.settings.phone}     GSTIN: ${this.settings.gstin}

🧾 BILL DETAILS
Bill No: ${this.bill.billNo}
Date: ${new Date(this.bill.date).toLocaleDateString()}      Time: ${this.bill.time}
Payment: ${paymentsText}
${patientDetails}
🔬 TESTS / PRODUCTS
${itemsText}

Subtotal: ₹${this.bill.subtotal.toFixed(2)}
Discount: ₹${this.bill.discount.toFixed(2)}
Grand Total: ₹${this.bill.grandTotal.toFixed(2)}
Paid Amount: ₹${this.bill.paidAmount.toFixed(2)}
Due Amount: ₹${this.bill.dueAmount.toFixed(2)}

Amount in Words: ${numberToWordsIndian(this.bill.grandTotal)}
${this.bill.reportStatus ? `\nReport Delivered: ${this.bill.reportStatus}` : ''}
${thinLine}
“This bill is computer generated. No seal or signature required. This invoice can also be used for claim purposes.”
${thinLine}
        `.trim();
    }
}


export default Billing;