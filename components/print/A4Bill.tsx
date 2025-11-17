
import React, { forwardRef } from 'react';
import { Bill, BillType, Settings } from '../../types';
import { formatCurrency, numberToWordsIndian } from '../../services/utils';

interface A4BillProps {
    bill: Bill;
    settings: Settings;
}

const A4Bill = forwardRef<HTMLDivElement, A4BillProps>(({ bill, settings }, ref) => {
    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans w-[210mm] min-h-[297mm] mx-auto flex flex-col">
            <div className="flex-grow">
                {/* Header */}
                <header className="flex justify-between items-start pb-4 border-b-2 border-yellow-500">
                    <div>
                        <h1 className="text-4xl font-bold font-poppins text-gray-800">{settings.shopName}</h1>
                        <p className="text-sm text-gray-600">{settings.address}</p>
                        <p className="text-sm text-gray-600">Phone: {settings.phone} | GSTIN: {settings.gstin}</p>
                    </div>
                    {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-20 w-20 object-contain" />}
                </header>

                {/* Bill & Patient Details */}
                <section className="grid grid-cols-2 gap-8 my-8">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-gray-700 mb-2">BILL TO:</h3>
                        {bill.billType === BillType.MEDICAL ? (
                            <>
                                <p><span className="font-semibold">Name:</span> {bill.patient?.name}</p>
                                <p><span className="font-semibold">Age/Gender:</span> {bill.patient?.age}/{bill.patient?.gender}</p>
                                <p><span className="font-semibold">Phone:</span> {bill.patient?.phone}</p>
                                <p><span className="font-semibold">Referred By:</span> {bill.patient?.referredBy}</p>
                            </>
                        ) : (
                            <p><span className="font-semibold">Name:</span> {bill.customerName || 'N/A'}</p>
                        )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                         <h3 className="font-bold text-gray-700 mb-2">INVOICE DETAILS:</h3>
                        <p><span className="font-semibold">Bill No:</span> {bill.billNo}</p>
                        <p><span className="font-semibold">Date:</span> {new Date(bill.date).toLocaleDateString()}</p>
                        <p><span className="font-semibold">Time:</span> {bill.time}</p>
                        <p><span className="font-semibold">Payment:</span> {bill.payments.map(p => `${p.mode} (${formatCurrency(p.amount)})`).join(', ')}</p>
                    </div>
                </section>

                {/* Items Table */}
                <section className="my-8">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="p-3">#</th>
                                <th className="p-3">Item Description</th>
                                <th className="p-3 text-center">Qty</th>
                                <th className="p-3 text-right">Price</th>
                                <th className="p-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.items.map((item, index) => (
                                <tr key={item.id} className="border-b">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">{item.name}</td>
                                    <td className="p-3 text-center">{item.quantity}</td>
                                    <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                                    <td className="p-3 text-right">{formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Summary */}
                <section className="flex justify-end my-8">
                    <div className="w-1/2 space-y-2">
                        <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span> <span className="font-semibold">{formatCurrency(bill.subtotal)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Discount:</span> <span className="font-semibold">{formatCurrency(bill.discount)}</span></div>
                        <div className="flex justify-between font-bold text-xl border-t border-b py-2"><span className="text-gray-800">Grand Total:</span> <span>{formatCurrency(bill.grandTotal)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Paid Amount:</span> <span className="font-semibold">{formatCurrency(bill.paidAmount)}</span></div>
                        <div className="flex justify-between font-bold"><span className="text-gray-800">Due Amount:</span> <span>{formatCurrency(bill.dueAmount)}</span></div>
                    </div>
                </section>
                
                {/* Amount in words & Status */}
                <section className="my-8">
                    <p className="text-sm"><span className="font-semibold">Amount in Words:</span> {numberToWordsIndian(bill.grandTotal)}</p>
                    {bill.billType === BillType.MEDICAL && (
                         <p className="text-sm mt-2"><span className="font-semibold">Report Status:</span> <span className="font-bold">{bill.reportStatus}</span></p>
                    )}
                </section>
            </div>
            {/* Footer */}
            <footer className="text-center text-xs text-gray-500 border-t pt-4">
                <p>All prices are inclusive of GST.</p>
                <p>This bill is computer generated. No seal or signature required. This invoice can also be used for claim purposes.</p>
            </footer>
        </div>
    );
});

export default A4Bill;
