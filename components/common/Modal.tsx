import React, { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className={`relative w-auto mx-auto my-6 z-50 ${className}`}>
        <div className="relative flex flex-col w-full bg-light-surface border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-light-outline">
            <h3 className="text-2xl font-semibold text-light-onSurface">
              Bộ lọc nâng cao
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-light-onSurfaceVariant float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              <span className="bg-transparent text-light-onSurfaceVariant h-6 w-6 text-2xl block outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
