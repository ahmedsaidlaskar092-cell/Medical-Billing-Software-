
import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background border border-border-color rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-poppins font-semibold mb-4">{title}</h2>
        <p className="text-text-secondary mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="bg-card text-text-primary px-6 py-2 rounded-lg hover:opacity-80">Cancel</button>
          <button onClick={onConfirm} className="bg-danger text-white px-6 py-2 rounded-lg hover:opacity-90">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
