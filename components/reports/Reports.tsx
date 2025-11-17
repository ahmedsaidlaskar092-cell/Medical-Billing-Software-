import React, { useState } from 'react';
import useMockData from '../../hooks/useMockData';
import { getComplexSalesReport } from '../../services/geminiService';
import Spinner from '../ui/Spinner';
import { exportToCsv } from '../../services/utils';
import Icon from '../ui/Icon';
import { useToast } from '../../hooks/useToast';

const Reports: React.FC = () => {
    const { bills, dailyExpenses, partyPayments, parties, loading } = useMockData();
    const { addToast } = useToast();
    const [report, setReport] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        try {
            const result = await getComplexSalesReport(bills);
            setReport(result);
            addToast({ message: 'AI report generated successfully.', type: 'success' });
        } catch (error: any) {
            setReport("Failed to generate report. Please check your Gemini API key and try again.");
            addToast({ message: error.message || 'Failed to generate report.', type: 'error' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportAllData = () => {
        setIsExporting(true);
        try {
            const partyMap = parties.reduce((acc, p) => {
                acc[p.id] = p.name;
                return acc;
            }, {} as Record<string, string>);

            const salesData = bills.map(bill => ({
                rawDate: new Date(bill.date),
                Date: new Date(bill.date).toLocaleDateString(),
                Type: 'Sale',
                'Reference No': bill.billNo,
                'Patient/Customer/Party': bill.patient?.name || bill.customerName || 'N/A',
                'Patient ID': bill.patient?.id || 'N/A',
                Details: bill.items.map(i => `${i.name} (x${i.quantity})`).join(', '),
                'Amount In (INR)': bill.paidAmount,
                'Amount Out (INR)': 0,
                'Due Amount (INR)': bill.dueAmount,
            }));

            const purchaseData = partyPayments.map(pp => ({
                rawDate: new Date(pp.date),
                Date: new Date(pp.date).toLocaleDateString(),
                Type: 'Purchase',
                'Reference No': pp.notes || pp.id,
                'Patient/Customer/Party': partyMap[pp.partyId] || 'Unknown Party',
                'Patient ID': '',
                Details: `Payment via ${pp.paymentMode}`,
                'Amount In (INR)': 0,
                'Amount Out (INR)': pp.amount,
                'Due Amount (INR)': 0,
            }));

            const expenseData = dailyExpenses.map(de => ({
                rawDate: new Date(de.date),
                Date: new Date(de.date).toLocaleDateString(),
                Type: 'Expense',
                'Reference No': de.id,
                'Patient/Customer/Party': de.category,
                'Patient ID': '',
                Details: de.description,
                'Amount In (INR)': 0,
                'Amount Out (INR)': de.amount,
                'Due Amount (INR)': 0,
            }));
            
            const allData = [...salesData, ...purchaseData, ...expenseData];
            
            allData.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

            const finalDataForExport = allData.map(({ rawDate, ...rest }) => rest);

            exportToCsv(`Master_Report_${new Date().toISOString().slice(0, 10)}.csv`, finalDataForExport);
            addToast({ message: 'Data exported successfully.', type: 'success' });
        } catch (error) {
            addToast({ message: 'Failed to export data.', type: 'error' });
        }
        setIsExporting(false);
    };
    
    if (loading) return <Spinner />;

    return (
        <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-poppins font-semibold">Reports & Analysis</h2>
                 <div className="flex items-center gap-4">
                    <button
                        onClick={handleExportAllData}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-success/20 text-success font-semibold py-2 px-4 rounded-lg hover:bg-success/40 transition-all duration-300 disabled:opacity-50"
                    >
                        <Icon name="download" className="w-5 h-5"/>
                        {isExporting ? 'Exporting...' : 'Export All Data'}
                    </button>
                    <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-300 shadow-secondary disabled:opacity-50"
                    >
                        {isGenerating ? 'Analyzing...' : 'Generate AI Sales Report (Pro)'}
                    </button>
                </div>
            </div>
            
            <div className="bg-card p-4 rounded-lg">
                <div className="prose prose-invert max-w-none overflow-x-auto">
                    {isGenerating && <div className="flex flex-col items-center gap-4"><Spinner /><p>Gemini is thinking... this may take a moment.</p></div>}
                    {report ? (
                        <div dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br />') }} />
                    ) : (
                        <div className="text-center py-10 text-text-secondary">
                            <p>Click the button above to generate a detailed sales analysis using Gemini 2.5 Pro.</p>
                            <p className="text-sm mt-2">(Requires a valid Gemini API Key)</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;