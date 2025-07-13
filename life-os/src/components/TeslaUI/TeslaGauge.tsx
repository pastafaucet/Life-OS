import React from 'react';

interface TeslaGaugeProps {
  value: number;
  max?: number;
  min?: number;
  label?: string;
  unit?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const TeslaGauge: React.FC<TeslaGaugeProps> = ({
  value,
  max = 100,
  min = 0,
  label,
  unit = '',
  color = 'blue',
  size = 'md',
  showValue = true,
  className = ''
}) => {
  const normalizedValue = Math.max(min, Math.min(max, value));
  const percentage = ((normalizedValue - min) / (max - min)) * 100;

  const colorClasses = {
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
    orange: 'stroke-orange-500',
    red: 'stroke-red-500',
    purple: 'stroke-purple-500'
  };

  const sizeClasses = {
    sm: { size: 120, strokeWidth: 8, textSize: 'text-lg' },
    md: { size: 160, strokeWidth: 10, textSize: 'text-2xl' },
    lg: { size: 200, strokeWidth: 12, textSize: 'text-3xl' }
  };

  const { size: svgSize, strokeWidth, textSize } = sizeClasses[size];
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <svg
          width={svgSize}
          height={svgSize / 2 + 20}
          className="transform -rotate-90"
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${svgSize / 2} A ${radius} ${radius} 0 0 1 ${svgSize - strokeWidth / 2} ${svgSize / 2}`}
            fill="none"
            stroke="rgb(55, 65, 81)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M ${strokeWidth / 2} ${svgSize / 2} A ${radius} ${radius} 0 0 1 ${svgSize - strokeWidth / 2} ${svgSize / 2}`}
            fill="none"
            className={colorClasses[color]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`font-bold text-white ${textSize}`}>
              {normalizedValue}{unit}
            </div>
            {label && (
              <div className="text-sm text-gray-400 mt-1">
                {label}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeslaGauge;
