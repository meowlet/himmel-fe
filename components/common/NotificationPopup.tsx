"use client";
import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({
  isOpen,
  onClose,
  onDontShowAgain,
}) => {
  const [dontShow, setDontShow] = useState(false);

  const handleClose = () => {
    if (dontShow) {
      onDontShowAgain();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-auto transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-3">
                Mình đang có vấn đề thủ tục với{" "}
                <span className="font-semibold text-amber-600">
                  bên cho thuê storage
                </span>
                .
              </p>
              <p className="mb-3">
                Do đó, một vài tính năng sẽ bị ảnh hưởng như:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Hình ảnh bìa truyện, trang truyện không hiển thị được</li>
                <li>Ảnh đại diện user cũng bị lỗi</li>
                <li>Các file media khác sẽ không khả dụng</li>
                <li>Còn lại, tất cả các tính năng vẫn sử dụng bình thường</li>
              </ul>
              <p className="mt-3 text-sm text-gray-600">
                Sau này nếu có thời gian, mình sẽ migrate sang platform khác để
                tránh mấy tình huống như này. Cảm ơn mọi người đã thông cảm.
              </p>
            </div>

            {/* Checkbox */}
            <div className="flex items-start space-x-3 pt-2">
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="dontShowAgain"
                className="text-sm text-gray-600 cursor-pointer select-none"
              >
                Don't show this message again
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleClose}
            className="w-full bg-light-primary hover:bg-light-primary text-light-onPrimary font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
