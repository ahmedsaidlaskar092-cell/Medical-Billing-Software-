import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../ui/Icon';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import { useToast } from '../../hooks/useToast';

interface DeviceManagementProps {
    authorizedDevices: string[];
    allUsers: User[];
    removeDevice: (userId: string) => void;
}

const DeviceManagement: React.FC<DeviceManagementProps> = ({ authorizedDevices, allUsers, removeDevice }) => {
    const { user: currentUser } = useAuth();
    const { addToast } = useToast();
    const [deviceToRemove, setDeviceToRemove] = useState<User | null>(null);

    const authorizedUsers = authorizedDevices.map(deviceId => {
        return allUsers.find(u => u.id === deviceId && u.role === UserRole.OWNER);
    }).filter((u): u is User => u !== undefined);

    const handleRemoveClick = (user: User) => {
        setDeviceToRemove(user);
    };

    const handleConfirmRemove = () => {
        if (deviceToRemove) {
            removeDevice(deviceToRemove.id);
            addToast({ message: `Device for ${deviceToRemove.fullName} has been removed.`, type: 'success' });
            setDeviceToRemove(null);
        }
    };

    return (
        <div className="bg-card border border-border-color rounded-xl p-6 backdrop-blur-md max-w-4xl mx-auto">
            <h2 className="text-2xl font-poppins font-semibold mb-2">Device Management</h2>
            <p className="text-text-secondary mb-6">
                You can have a maximum of 4 owner-level devices logged in simultaneously.
                Remove a device to free up a slot. You cannot remove your current device.
            </p>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-border-color">
                        <tr>
                            <th className="p-3">User</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Device ID</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {authorizedUsers.map(user => (
                            <tr key={user.id} className="border-b border-border-color hover:bg-card">
                                <td className="p-3">{user.fullName}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3 font-mono text-sm text-text-secondary">{user.id}</td>
                                <td className="p-3 text-right">
                                    <button 
                                        onClick={() => handleRemoveClick(user)} 
                                        disabled={user.id === currentUser?.id}
                                        className="bg-danger/20 text-danger px-3 py-1 rounded-md text-sm hover:bg-danger/40 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {authorizedUsers.length === 0 && (
                    <div className="text-center py-10 text-text-secondary">No owner devices are currently authorized.</div>
                )}
            </div>
            
            <ConfirmationDialog
                isOpen={!!deviceToRemove}
                onClose={() => setDeviceToRemove(null)}
                onConfirm={handleConfirmRemove}
                title="Remove Device"
                message={`Are you sure you want to remove the device for "${deviceToRemove?.fullName}"? They will be logged out and will need to log in again.`}
            />
        </div>
    );
};

export default DeviceManagement;