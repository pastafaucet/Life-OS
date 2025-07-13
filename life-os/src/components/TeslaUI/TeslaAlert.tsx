import React from 'react';

interface TeslaAlertProps {
  children: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error' | 'critical';
  title?: string;
  dismissible?: boolean;
  pulsing?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const TeslaAlert: React.FC<TeslaAlertProps> = ({
  children,
  type = 'info',
  title,
  dismissible = false,
  pulsing = false,
  onDismiss,
  className = ''
}) => {
  const typeClasses = {
    info: 'bg-gradient-to-r from-blue-600/20 to-blue-800/20 border-blue-500/30 text-blue-100',
    success: 'bg-gradient-to-r from-green-600/20 to-green-800/20 border-green-500/30 text-green-100',
    warning: 'bg-gradient-to-r from-orange-600/20 to-orange-800/20 border-orange-500/30 text-orange-100',
    error: 'bg-gradient-to-r from-red-600/20 to-red-800/20 border-red-500/30 text-red-100',
    critical: 'bg-gradient-to-r from-red-700/30 to-red-900/30 border-red-400/50 text-red-50'
  };

  const iconMap = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    critical: '🚨'
  };

  const pulsingClass = pulsing ? 'animate-pulse' : '';

  return (
    <div className={`
      ${typeClasses[type]}
      ${pulsingClass}
      rounded-xl border backdrop-blur-sm p-4 shadow-lg
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-xl flex-shrink-0 mt-0.5">
            {iconMap[type]}
          </div>
          <div className="flex-1">
            {title && (
              <div className="font-semibold text-lg mb-1">
                {title}
              </div>
            )}
            <div className="text-sm leading-relaxed">
              {children}
            </div>
          </div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="text-white/60 hover:text-white/80 transition-colors duration-200 ml-4 text-xl leading-none"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default TeslaAlert;
