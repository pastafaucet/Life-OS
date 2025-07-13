import React from 'react';

interface TeslaStatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error' | 'processing';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

const TeslaStatusIndicator: React.FC<TeslaStatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  showPulse = true,
  className = ''
}) => {
  const statusConfig = {
    online: {
      color: 'bg-green-500',
      ringColor: 'ring-green-500/30',
      textColor: 'text-green-400',
      icon: '●'
    },
    offline: {
      color: 'bg-gray-500',
      ringColor: 'ring-gray-500/30',
      textColor: 'text-gray-400',
      icon: '●'
    },
    warning: {
      color: 'bg-orange-500',
      ringColor: 'ring-orange-500/30',
      textColor: 'text-orange-400',
      icon: '⚠'
    },
    error: {
      color: 'bg-red-500',
      ringColor: 'ring-red-500/30',
      textColor: 'text-red-400',
      icon: '✕'
    },
    processing: {
      color: 'bg-blue-500',
      ringColor: 'ring-blue-500/30',
      textColor: 'text-blue-400',
      icon: '◐'
    }
  };

  const sizeClasses = {
    sm: {
      dot: 'w-2 h-2',
      ring: 'w-4 h-4',
      text: 'text-xs',
      gap: 'gap-2'
    },
    md: {
      dot: 'w-3 h-3',
      ring: 'w-6 h-6',
      text: 'text-sm',
      gap: 'gap-3'
    },
    lg: {
      dot: 'w-4 h-4',
      ring: 'w-8 h-8',
      text: 'text-base',
      gap: 'gap-4'
    }
  };

  const config = statusConfig[status];
  const sizes = sizeClasses[size];
  
  const pulseClass = showPulse && (status === 'online' || status === 'processing') 
    ? 'animate-pulse' 
    : '';

  const spinClass = status === 'processing' ? 'animate-spin' : '';

  return (
    <div className={`flex items-center ${sizes.gap} ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div className={`
          ${sizes.ring} 
          ${config.ringColor} 
          ${pulseClass}
          rounded-full ring-2 ring-offset-2 ring-offset-gray-900
        `} />
        
        {/* Inner dot */}
        <div className={`
          absolute 
          ${sizes.dot} 
          ${config.color} 
          ${spinClass}
          rounded-full flex items-center justify-center
        `}>
          {status === 'processing' && (
            <div className="text-white text-xs">
              {config.icon}
            </div>
          )}
        </div>
      </div>
      
      {label && (
        <span className={`
          ${config.textColor} 
          ${sizes.text} 
          font-medium
        `}>
          {label}
        </span>
      )}
    </div>
  );
};

export default TeslaStatusIndicator;
