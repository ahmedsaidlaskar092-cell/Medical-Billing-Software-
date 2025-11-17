
import React, { forwardRef } from 'react';
import { Bill, Settings, BillType } from '../../types';
import { formatCurrency, numberToWordsIndian } from '../../services/utils';

interface ThermalBillProps {
    bill: Bill;
    settings: Settings;
    width: '58mm' | '80mm';
}

const ThermalBill = forwardRef<HTMLDivElement, ThermalBillProps>(({ bill, settings, width }, ref) => {
    const is58mm = width === '58mm';
    const style = {
        width: width,
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: is58mm ? '10px' : '12px',
        color: '#000',
        backgroundColor: '#fff',
        padding: is58mm ? '5px' : '10px',
        lineHeight: '1.4',
    };

    const hr = () => <div className="border-t border-dashed border-black my-2"></div>;

    return (
        <div ref={ref} style={style}>
            <div className="text-center">
                <h1 className="font-bold text-lg">{settings.shopName}</h1>
                <p>{settings.address}</p>
                <p>Ph: {settings.phone} | GST: {settings.gstin}</p>
            </div>
            {hr()}
            <div>
                <p>Bill No: {bill.billNo}</p>
                <p>Date: {new Date(bill.date).toLocaleDateString()} {bill.time}</p>
            </div>
            {bill.billType === BillType.MEDICAL && bill.patient && (
                 <div>
                    <p>Patient: {bill.patient.name} ({bill.patient.age}/{bill.patient.gender})</p>
                    <p>Referred by: {bill.patient.referredBy}</p>
                </div>
            )}
             {bill.billType === BillType.RETAIL && bill.customerName && (
                <p>Customer: {bill.customerName}</p>
            )}
            {hr()}
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="text-left">Item</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Rate</th>
                        <th className="text-right">Amt</th>
                    </tr>
                </thead>
                <tbody>
                    {bill.items.map(item => (
                        <tr key={item.id}>
                            <td className="text-left w-[55%] break-words">{item.name}</td>
                            <td className="text-right">{item.quantity}</td>
                            <td className="text-right">{item.price.toFixed(2)}</td>
                            <td className="text-right">{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {hr()}
            <div className="text-right">
                <p>Subtotal: {bill.subtotal.toFixed(2)}</p>
                <p>Discount: {bill.discount.toFixed(2)}</p>
                <p className="font-bold">Grand Total: {bill.grandTotal.toFixed(2)}</p>
            </div>
            {hr()}
             <div className="text-right">
                 {bill.payments.map((p, i) => (
                    <p key={i}>{p.mode}: {p.amount.toFixed(2)}</p>
                ))}
                <p className="font-bold">Total Paid: {bill.paidAmount.toFixed(2)}</p>
                <p>Due: {bill.dueAmount.toFixed(2)}</p>
            </div>
            {hr()}
            <div>
                <p className="text-xs">In Words: {numberToWordsIndian(bill.grandTotal)}</p>
            </div>
            {bill.reportStatus && (
                <>
                {hr()}
                <p>Report Status: <span className="font-bold">{bill.reportStatus}</span></p>
                </>
            )}
            {hr()}
            <div className="text-center text-xs">
                <p>All prices are inclusive of GST.</p>
                <p>This bill is computer generated. No seal or signature required. This invoice can also be used for claim purposes.</p>
            </div>
        </div>
    );
});

export default ThermalBill;
