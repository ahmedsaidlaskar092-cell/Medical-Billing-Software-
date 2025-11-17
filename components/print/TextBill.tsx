
import React from 'react';
import { Bill, BillType, Settings } from '../../types';
import { numberToWordsIndian } from '../../services/utils';

interface TextBillProps {
    bill: Bill;
    settings: Settings;
}

const TextBill: React.FC<TextBillProps> = ({ bill, settings }) => {
    const horizontalLine = '══════════════════════════════════════';
    const thinLine = '———————————————————————';

    const itemsText = bill.items.map(item =>
        `• ${item.name} (x${item.quantity})  ₹${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

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
    `;

    return (
        <pre id="text-bill-content" className="bg-gray-900 text-white p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
            {billText.trim()}
        </pre>
    );
};

export default TextBill;
