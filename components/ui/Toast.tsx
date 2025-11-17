import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../../hooks/useToast';
import Icon from './Icon';

interface ToastProps {
    toast: ToastMessage;
    onClose: () => void;
}

const toastConfig = {
    success: {
        icon: 'check-circle',
        bgClass: 'bg-success/20 border-success text-success',
    },
    error: {
        icon: 'x-circle',
        bgClass: 'bg-danger/20 border-danger text-danger',
    },
    info: {
        icon: 'information-circle',
        bgClass: 'bg-primary/20 border-primary text-primary',
    },
};

const CustomIcon: React.FC<{ name: string; className: string }> = ({ name, className }) => {
    const icons: { [key: string]: React.ReactNode } = {
        'check-circle': <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
        'x-circle': <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
        'information-circle': <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />,
    };
    return (
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            {icons[name]}
        </svg>
    )
};


const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 5000); // Auto-dismiss after 5 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 400); // Wait for fade-out animation
    };

    const config = toastConfig[toast.type];

    return (
        <div 
            className={`flex items-center gap-4 w-full max-w-sm p-4 rounded-xl border animate-slideIn ${config.bgClass} ${isExiting ? 'animate-fadeOut' : ''}`}
            role="alert"
        >
            <CustomIcon name={config.icon} className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button onClick={handleClose} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-white">
                <Icon name="close" className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Toast;
