import React, { useState, useRef } from 'react';
import * as reactToPrint from 'react-to-print';
import { Bill, BillType, Settings } from '../../types';
import A4Bill from './A4Bill';
import ThermalBill from './ThermalBill';
import TextBill from './TextBill';
// FIX: mockSettings is now exported and can be imported.
import { mockSettings } from '../../services/mockData';
import Icon from '../ui/Icon';
import { numberToWordsIndian } from '../../services/utils';

const useReactToPrint = (reactToPrint as any)?.default?.useReactToPrint || (reactToPrint as any)?.useReactToPrint;

interface PrintModalProps {
    bill: Bill;
    onClose: () => void;
}

type PrintFormat = 'A4' | '80mm' | '58mm' | 'Text';

const PrintModal: React.FC<PrintModalProps> = ({ bill, onClose }) => {
    const [format, setFormat] = useState<PrintFormat>('A4');
    const settings: Settings = mockSettings;
    
    const printRef = useRef<HTMLDivElement>(null);
    const a4Ref = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint ? useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Invoice-${bill.billNo}`,
    }) : () => alert('Print service failed to load.');

    const handleDownloadPdf = useReactToPrint ? useReactToPrint({
        content: () => a4Ref.current,
        documentTitle: `Invoice-${bill.billNo}`,
    }) : () => alert('Print service failed to load.');

    const handleShareWhatsApp = () => {
        const phone = bill.patient?.phone || '';
        if (!phone) {
            alert("No phone number available to share.");
            return;
        }
        
        const horizontalLine = '══════════════════════════════════════';
        const thinLine = '———————————————————————';
        const itemsText = bill.items.map(item => `• ${item.name} (x${item.quantity})  ₹${(item.price * item.quantity).toFixed(2)}`).join('\n');
        const patientDetails = bill.billType === BillType.MEDICAL ? `
👤 PATIENT DETAILS
Name: ${bill.patient?.name}
Age/Gender: ${bill.patient?.age}/${bill.patient?.gender}
Phone: ${bill.patient?.phone}
Doctor: ${bill.patient?.referredBy}
` : '';
        const paymentsText = bill.payments.map(p => `${p.mode}: ₹${p.amount.toFixed(2)}`).join(', ');

        const billText = `
${horizontalLine}
           ${settings.shopName}
${horizontalLine}
Address: ${settings.address}
Phone: ${settings.phone}     GSTIN: ${settings.gstin}

🧾 BILL DETAILS
Bill No: ${bill.billNo}
Date: ${new Date(bill.date).toLocaleDateString()}      Time: ${bill.time}
Payment: ${paymentsText}
${patientDetails}
🔬 TESTS / PRODUCTS
${itemsText}

Subtotal: ₹${bill.subtotal.toFixed(2)}
Discount: ₹${bill.discount.toFixed(2)}
Grand Total: ₹${bill.grandTotal.toFixed(2)}
Paid Amount: ₹${bill.paidAmount.toFixed(2)}
Due Amount: ₹${bill.dueAmount.toFixed(2)}

Amount in Words: ${numberToWordsIndian(bill.grandTotal)}
${bill.reportStatus ? `\nReport Delivered: ${bill.reportStatus}` : ''}
${thinLine}
“This bill is computer generated. All prices are inclusive of GST. No seal or signature required. This invoice can also be used for claim purposes.”
${thinLine}
        `.trim();
        
        const encodedText = encodeURIComponent(billText);
        window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
    };

    
    const copyToClipboard = () => {
        const textContent = document.getElementById('text-bill-content')?.innerText;
        if (textContent) {
            navigator.clipboard.writeText(textContent).then(() => {
                alert('Bill copied to clipboard!');
            }, (err) => {
                alert('Failed to copy bill.');
            });
        }
    };

    const renderPreview = () => {
        switch (format) {
            case 'A4':
                return (
                    <div className="flex justify-center items-start overflow-auto h-full">
                       <div className="scale-[0.35] sm:scale-50 md:scale-75 lg:scale-100 origin-top transform transition-transform">
                           <A4Bill ref={printRef} bill={bill} settings={settings} />
                       </div>
                    </div>
                );
            case '80mm':
                return <ThermalBill ref={printRef} bill={bill} settings={settings} width="80mm" />;
            case '58mm':
                return <ThermalBill ref={printRef} bill={bill} settings={settings} width="58mm" />;
            case 'Text':
                return <TextBill bill={bill} settings={settings} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border-color rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-poppins font-semibold">Print Preview</h2>
                    <div className="flex items-center gap-4">
                        <select value={format} onChange={e => setFormat(e.target.value as PrintFormat)} className="bg-card border border-border-color rounded-lg px-3 py-1 text-text-primary">
                            <option value="A4">A4</option>
                            <option value="80mm">80mm Thermal</option>
                            <option value="58mm">58mm Thermal</option>
                            <option value="Text">Text (WhatsApp)</option>
                        </select>
                         <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><Icon name="close" /></button>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-auto bg-black/20">
                    {renderPreview()}
                </main>
                <footer className="p-4 border-t border-border-color flex flex-wrap justify-end gap-3">
                    <button onClick={onClose} className="bg-card text-text-primary px-4 py-2 rounded-lg hover:opacity-80">Close</button>
                    <button 
                        onClick={handleShareWhatsApp}
                        disabled={!bill.patient?.phone}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    >
                        Share on WhatsApp
                    </button>
                    <button 
                        onClick={handleDownloadPdf} 
                        className="bg-secondary text-white px-4 py-2 rounded-lg hover:opacity-90"
                    >
                        Download PDF
                    </button>
                    {format === 'Text' ? (
                         <button onClick={copyToClipboard} className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 shadow-primary">Copy Text</button>
                    ) : (
                         <button onClick={handlePrint} className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 shadow-primary">Print ({format})</button>
                    )}
                </footer>
            </div>
            {/* Hidden A4 component for direct PDF download */}
            <div className="hidden">
                 <A4Bill ref={a4Ref} bill={bill} settings={settings} />
            </div>
        </div>
    );
};

export default PrintModal;