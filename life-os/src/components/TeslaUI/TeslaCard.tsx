import React from 'react';

interface TeslaCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'gray';
  hover?: boolean;
  onClick?: () => void;
}

const TeslaCard: React.FC<TeslaCardProps> = ({ 
  children, 
  className = '', 
  gradient = 'gray',
  hover = true,
  onClick 
}) => {
  const gradientClasses = {
    blue: 'bg-gradient-to-br from-blue-600 to-blue-800',
    purple: 'bg-gradient-to-br from-purple-600 to-purple-800',
    green: 'bg-gradient-to-br from-green-600 to-green-800',
    orange: 'bg-gradient-to-br from-orange-600 to-orange-800',
    red: 'bg-gradient-to-br from-red-600 to-red-800',
    gray: 'bg-gradient-to-br from-gray-700 to-gray-800'
  };

  const hoverClass = hover ? 'hover:scale-105 transition-transform duration-200' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`
        ${gradientClasses[gradient]}
        rounded-xl p-6 shadow-lg backdrop-blur-sm border border-white/10
        ${hoverClass} ${clickableClass} ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default TeslaCard;
