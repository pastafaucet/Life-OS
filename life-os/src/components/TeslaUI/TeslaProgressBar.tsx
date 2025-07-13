import React from 'react';

interface TeslaProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

const TeslaProgressBar: React.FC<TeslaProgressBarProps> = ({
  value,
  max = 100,
  label,
  color = 'blue',
  size = 'md',
  showPercentage = true,
  animated = true,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
    red: 'bg-gradient-to-r from-red-500 to-red-600',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600'
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const animationClass = animated ? 'transition-all duration-500 ease-out' : '';

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-300">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-bold text-white">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full ${animationClass} shadow-lg`}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeslaProgressBar;
