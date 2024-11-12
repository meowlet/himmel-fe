import React from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-light-surface text-left shadow-xl transition-all sm:w-full sm:max-w-lg">
          {children}
        </div>
      </div>
    </div>
  );
};
