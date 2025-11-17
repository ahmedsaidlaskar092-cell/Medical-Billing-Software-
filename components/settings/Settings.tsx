import React, { useState } from 'react';
import useMockData from '../../hooks/useMockData';
import { useTheme, themes } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';

const Settings: React.FC = () => {
    const { settings: initialSettings, setSettings } = useMockData();
    const [formData, setFormData] = useState(initialSettings);
    const { theme, setTheme } = useTheme();
    const { addToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setSettings(formData);
        addToast({ message: 'Settings saved successfully!', type: 'success' });
    };

    const inputClasses = "w-full bg-card border border-border-color rounded-lg px-4 py-2 text-text-primary";

    return (
        <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md max-w-3xl mx-auto">
            <h2 className="text-2xl font-poppins font-semibold mb-6">Settings</h2>
            <div className="space-y-4">
                <input name="shopName" value={formData.shopName} onChange={handleChange} placeholder="Shop Name" className={inputClasses} />
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className={inputClasses} />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className={inputClasses} />
                <input name="gstin" value={formData.gstin} onChange={handleChange} placeholder="GSTIN" className={inputClasses} />
                <input name="upiId" value={formData.upiId} onChange={handleChange} placeholder="UPI ID" className={inputClasses} />
                
                <div>
                  <label className="block text-text-secondary mb-2">Logo Upload</label>
                  <input type="file" className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"/>
                </div>

                <div className="pt-4">
                    <button onClick={handleSave} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-all duration-300 shadow-primary">
                        Save Settings
                    </button>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border-color">
                <h3 className="text-lg font-poppins font-semibold mb-4">Theme</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Object.entries(themes).map(([key, themeOption]) => (
                        <button
                            key={key}
                            onClick={() => setTheme(key)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                theme === key ? 'border-primary' : 'border-transparent hover:border-gray-600'
                            }`}
                            style={{ backgroundColor: themeOption.colors.card }}
                        >
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: themeOption.colors.primary }}></div>
                                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: themeOption.colors.secondary }}></div>
                                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: themeOption.colors.accent }}></div>
                            </div>
                            <p className="font-semibold text-center text-sm" style={{ color: themeOption.colors.textPrimary }}>{themeOption.name}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Settings;