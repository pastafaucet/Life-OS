import React from 'react';

interface TeslaMetricProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TeslaMetric: React.FC<TeslaMetricProps> = ({
  label,
  value,
  icon,
  trend,
  trendValue,
  color = 'blue',
  size = 'md',
  className = ''
}) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    gray: 'text-gray-400 bg-gray-500/10 border-gray-500/20'
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const textSizeClasses = {
    sm: { value: 'text-lg', label: 'text-xs', trend: 'text-xs' },
    md: { value: 'text-2xl', label: 'text-sm', trend: 'text-sm' },
    lg: { value: 'text-3xl', label: 'text-base', trend: 'text-base' }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className={`
      ${colorClasses[color]}
      ${sizeClasses[size]}
      rounded-xl border backdrop-blur-sm
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`font-bold ${textSizeClasses[size].value} mb-1`}>
            {value}
          </div>
          <div className={`text-gray-300 ${textSizeClasses[size].label} font-medium`}>
            {label}
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 ${textSizeClasses[size].trend} ${getTrendColor()}`}>
              <span>{getTrendIcon()}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-2xl opacity-60">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeslaMetric;
