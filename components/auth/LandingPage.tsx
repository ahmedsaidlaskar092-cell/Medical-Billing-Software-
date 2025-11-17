import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../ui/Icon';
import { useToast } from '../../hooks/useToast';

const AuthForm: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, signup } = useAuth();
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isLoginView) {
                const message = await login(email, password);
                addToast({ message, type: 'success' });
                // The App component will handle the redirect
            } else {
                const message = await signup(fullName, email, password);
                addToast({ message, type: 'success' });
                setIsLoginView(true); // Switch to login view after successful signup
            }
        } catch (err: any) {
            addToast({ message: err.toString(), type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-background border border-border-color rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-poppins font-bold text-primary mb-2">Welcome</h1>
                <p className="text-text-secondary">{isLoginView ? 'Log in to continue' : 'Create your account'}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {!isLoginView && (
                    <div>
                        <label className="block text-text-secondary mb-2" htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full bg-card border border-border-color rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                )}
                <div>
                    <label className="block text-text-secondary mb-2" htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-card border border-border-color rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div>
                    <label className="block text-text-secondary mb-2" htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-card border border-border-color rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all duration-300 shadow-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
                </button>
            </form>

            <div className="text-center mt-6">
                <button onClick={() => { setIsLoginView(!isLoginView); }} className="text-primary hover:underline">
                    {isLoginView ? 'Need an account? Sign up' : 'Already have an account? Login'}
                </button>
            </div>
        </div>
    );
};


const features = [
    { icon: 'billing', title: 'Effortless Billing', description: 'Create medical and retail bills in seconds with a unified interface.' },
    { icon: 'dashboard', title: 'Live Dashboards', description: 'Monitor sales, dues, and stock in real-time from any device.' },
    { icon: 'dues', title: 'Due Management', description: 'Track and manage outstanding payments with reminders.' },
    { icon: 'reports', title: 'AI-Powered Reports', description: 'Gain deep insights into your business performance with Gemini.' },
    { icon: 'products', title: 'Product & Test Hub', description: 'Manage all your products, services, and medical tests centrally.' },
    { icon: 'settings', title: 'Multi-Format Printing', description: 'Print professional invoices in A4, 80mm, or 58mm formats.' },
];

const LandingPage: React.FC = () => {
    const [showAuth, setShowAuth] = useState(false);

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-16">
                    <h1 className="text-3xl font-poppins font-bold text-primary">Smart Bill Ultimate</h1>
                    <button onClick={() => setShowAuth(true)} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-all duration-300 shadow-primary">
                        Login / Sign Up
                    </button>
                </header>

                {/* Hero Section */}
                <section className="text-center mb-24">
                    <h2 className="text-5xl md:text-6xl font-poppins font-bold mb-4">The Ultimate Billing Solution for Your Business</h2>
                    <p className="text-lg text-text-secondary max-w-3xl mx-auto mb-8">
                        Streamline your medical and retail operations with a powerful, centralized system. From billing and inventory to AI-driven insights, Smart Bill Ultimate has you covered.
                    </p>
                    <button onClick={() => setShowAuth(true)} className="bg-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-all duration-300 shadow-primary">
                        Get Started
                    </button>
                </section>

                {/* Features Section */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md text-center">
                                <div className="inline-block p-4 rounded-full bg-primary/20 mb-4">
                                    <Icon name={feature.icon} className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-poppins font-semibold mb-2">{feature.title}</h3>
                                <p className="text-text-secondary">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
             {showAuth && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                   <div className="relative">
                     <AuthForm />
                     <button onClick={() => setShowAuth(false)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
                        <Icon name="close" className="w-8 h-8" />
                     </button>
                   </div>
                </div>
            )}
        </div>
    );
};


export default LandingPage;