
// Function to convert number to Indian currency words
export const numberToWordsIndian = (num: number): string => {
    if (num === 0) return 'Zero';

    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
        let str = '';
        if (n > 99) {
            str += a[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n > 19) {
            str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
        } else {
            str += a[n];
        }
        return str.trim();
    };

    let result = '';
    const numStr = Math.floor(num).toString();

    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    if (crore > 0) {
        result += inWords(crore) + ' Crore ';
    }

    const lakh = Math.floor(num / 100000);
    num %= 100000;
    if (lakh > 0) {
        result += inWords(lakh) + ' Lakh ';
    }

    const thousand = Math.floor(num / 1000);
    num %= 1000;
    if (thousand > 0) {
        result += inWords(thousand) + ' Thousand ';
    }

    const remaining = Math.floor(num);
    if (remaining > 0) {
        result += inWords(remaining);
    }
    
    const decimalPart = Math.round((num - Math.floor(num)) * 100);
    if (decimalPart > 0) {
        result += ' and ' + inWords(decimalPart) + ' Paisa';
    }

    return result.trim() + ' Only';
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

export const exportToCsv = (filename: string, rows: object[]) => {
    if (!rows || !rows.length) {
        alert("No data to export.");
        return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
        keys.join(separator) +
        '\n' +
        rows.map(row => {
            return keys.map(k => {
                let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
                cell = cell instanceof Date
                    ? cell.toLocaleString()
                    : cell.toString().replace(/"/g, '""');
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(separator);
        }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
