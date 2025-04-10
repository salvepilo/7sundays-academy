import React from 'react';

interface ErrorDisplayProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  type = 'error',
  className = ''
}) => {
  const baseStyles = 'p-4 rounded-lg mb-4 text-sm font-medium';
  
  const typeStyles = {
    error: 'bg-red-100 text-red-700 border border-red-400',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-400',
    info: 'bg-blue-100 text-blue-700 border border-blue-400'
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]} ${className}`} role="alert">
      {message}
    </div>
  );
};

export default ErrorDisplay;