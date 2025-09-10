
import React, { useEffect } from 'react';
import type { ToastType } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const baseClasses = "fixed top-5 right-5 z-50 flex items-center w-full max-w-xs p-4 space-x-4 text-gray-200 bg-gray-800 divide-x divide-gray-700 rounded-lg shadow space-x";
  const typeClasses = {
    success: 'border-l-4 border-green-500',
    error: 'border-l-4 border-red-500',
    info: 'border-l-4 border-blue-500',
  };

  const Icon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XIcon className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      {Icon() && <div className="pl-4">{Icon()}</div>}
      <div className="pl-4 text-sm font-normal">{message}</div>
      <button onClick={onClose} className="pl-4 pr-2 -mr-2">
        <XIcon className="w-5 h-5 text-gray-400 hover:text-white" />
      </button>
    </div>
  );
};

export default Toast;
