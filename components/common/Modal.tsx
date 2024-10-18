import React, { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  title = "Modal",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div
        className={`relative w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] mx-auto my-6 z-50 ${className}`}
      >
        <div className="relative flex flex-col w-full bg-light-surface border-0 rounded-lg shadow-lg outline-none focus:outline-none max-h-[90vh]">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-solid border-light-outline">
            <h3 className="text-xl sm:text-2xl font-semibold text-light-onSurface">
              {title}
            </h3>
            <button
              className="p-1 bg-transparent border-0 text-light-onSurfaceVariant hover:text-light-onSurface transition-colors duration-200 ease-in-out outline-none focus:outline-none"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

// CSS để ẩn thanh cuộn
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

// Thêm styles vào <head>
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = scrollbarHideStyles;
  document.head.appendChild(style);
}
