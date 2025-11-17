
import React from 'react';

interface IconProps {
    name: string;
    className?: string;
    style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6', style }) => {
    const icons: { [key: string]: React.ReactNode } = {
        dashboard: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l3-3m0 0l3-3m-3 3v6m0-6h6m-6 3h6m-6-3l3-3m-3 3l3 3" />,
        billing: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h5.25m-5.25 0h5.25m-5.25 0h5.25M3 4.5h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H3a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 013 4.5z" />,
        history: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
        dues: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m-6 2.25h6M12 2.25c-5.122 0-9.25 1.5-9.25 3.375s4.128 3.375 9.25 3.375 9.25-1.5 9.25-3.375S17.122 2.25 12 2.25zM12 18.75c-5.122 0-9.25-1.5-9.25-3.375s4.128-3.375 9.25-3.375 9.25 1.5 9.25 3.375S17.122 18.75 12 18.75z" />,
        reports: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />,
        products: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />,
        tests: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.5h3.832a2.25 2.25 0 002.25-2.25V6.25a2.25 2.25 0 00-2.25-2.25H13.5c-.621 0-1.125.504-1.125 1.125v1.5a3.375 3.375 0 003.375 3.375H19.5zm-6.096-10.5a.75.75 0 00-1.125.75v1.5a.75.75 0 001.125.75h1.5a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75h-1.5z" />,
        settings: <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.025 1.11-1.11a1.125 1.125 0 011.08 1.08c-.09.542-.56 1.025-1.11 1.11a1.125 1.125 0 01-1.08-1.08zM10.343 3.94a1.125 1.125 0 00-1.08-1.08c.09-.542.56-1.025 1.11-1.11a1.125 1.125 0 011.08 1.08c-.09.542-.56 1.025-1.11 1.11a1.125 1.125 0 00-1.08-1.08zM10.343 3.94c.09-.542.56-1.025 1.11-1.11a1.125 1.125 0 011.08 1.08c-.09.542-.56 1.025-1.11 1.11a1.125 1.125 0 01-1.08-1.08z" />,
        logout: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />,
        spark: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />,
        menu: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />,
        close: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
        wallet: <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 3V9m-13.5 6H21m-16.5 0H21m-16.5 0H7.5" />,
        download: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />,
        'arrow-up': <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />,
        'arrow-down': <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />,
        'receipt-refund': <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.696a4.5 4.5 0 016.364 0l1.09 1.09m-8.542-1.09a4.5 4.5 0 00-6.364 0l-1.09 1.09m10.9-10.9l-1.09 1.09a4.5 4.5 0 01-6.364 0l-1.09-1.09" />,
        users: <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.289 2.72a3 3 0 01-4.682 0 8.986 8.986 0 013.741.479m-9.873-4.56l-3.873 3.873a3 3 0 004.243 4.243l3.873-3.873M12 12.75h.008v.008H12v-.008z" />,
        devices: <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h9.75a2.25 2.25 0 012.25 2.25z" />,
    };

    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
            {icons[name] || null}
        </svg>
    );
};

export default Icon;