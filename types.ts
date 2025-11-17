
export enum UserRole {
    CENTER = 'CENTER',
    OWNER = 'OWNER',
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    password?: string; // Should not be stored in frontend state long-term
    role: UserRole;
}

export enum Gender {
    MALE = 'Male',
    FEMALE = 'Female',
    OTHER = 'Other',
}

export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: Gender;
    phone: string;
    referredBy?: string; // Doctor Name
}

export interface Test {
    id: string;
    name: string;
    code: string;
    department: string;
    mrp: number;
    sampleType?: string;
}

export interface Product {
    id:string;
    name: string;
    price: number;
    stock: number;
    category: string;
    isService: boolean;
}

export enum PaymentMode {
    CASH = 'Cash',
    UPI = 'UPI',
    CARD = 'Card',
}

export enum ReportStatus {
    DELIVERED = 'DELIVERED',
    NOT_DELIVERED = 'NOT DELIVERED',
}

export enum BillType {
    MEDICAL = 'Medical',
    RETAIL = 'Retail',
}

export interface BillItem {
    id: string; // Product or Test ID
    name: string;
    price: number; // MRP or selling price
    quantity: number; // Always 1 for tests
}

export interface Payment {
    mode: PaymentMode;
    amount: number;
}

export interface Bill {
    id: string;
    billNo: string;
    date: string; // ISO string
    time: string;
    billType: BillType;
    patient?: Patient;
    customerName?: string;
    items: BillItem[];
    subtotal: number;
    discount: number;
    grandTotal: number;
    paidAmount: number;
    dueAmount: number;
    payments: Payment[];
    reportStatus?: ReportStatus; // Only for medical bills
}

export interface Settings {
    shopName: string;
    address: string;
    phone: string;
    logoUrl?: string;
    upiId: string;
    gstin: string;
    defaultPrintSize: '58mm' | '80mm' | 'A4';
}

export interface Due {
    id: string;
    billId: string;
    customerName: string; // or patient name
    customerPhone: string;
    totalDue: number;
    lastPaymentDate?: string;
}

export interface Employee {
    id: string;
    name: string;
    role: string;
    monthlySalary: number;
    phone: string;
}

export enum SalaryPaymentType {
    SALARY = 'Salary',
    ADVANCE = 'Advance',
}

export interface SalaryPayment {
    id: string;
    employeeId: string;
    date: string; // ISO string
    amount: number;
    type: SalaryPaymentType;
    notes?: string;
}

export interface DailyExpense {
    id: string;
    date: string; // ISO string
    description: string;
    category: string;
    amount: number;
}

export interface Party {
    id: string;
    name: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    address?: string;
}

export interface PartyPayment {
    id: string;
    partyId: string;
    date: string; // ISO string
    amount: number;
    paymentMode: PaymentMode;
    notes?: string;
}
