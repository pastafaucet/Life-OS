import React from 'react';

interface TeslaChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  type?: 'bar' | 'line' | 'area';
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  className?: string;
}

const TeslaChart: React.FC<TeslaChartProps> = ({
  data,
  type = 'bar',
  height = 200,
  showGrid = true,
  showLabels = true,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const chartWidth = 400;
  const chartHeight = height - 40; // Leave space for labels

  const defaultColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
  ];

  const renderBars = () => {
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;

    return data.map((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = index * (barWidth + barSpacing) + barSpacing / 2;
      const y = chartHeight - barHeight;
      const color = item.color || defaultColors[index % defaultColors.length];

      return (
        <g key={index}>
          <rect
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={color}
            rx={4}
            className="transition-all duration-300 hover:opacity-80"
          />
          {showLabels && (
            <>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                className="fill-gray-400 text-xs"
              >
                {item.label}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="fill-white text-xs font-semibold"
              >
                {item.value}
              </text>
            </>
          )}
        </g>
      );
    });
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const gridLines = [];
    const steps = 5;
    
    for (let i = 0; i <= steps; i++) {
      const y = (chartHeight / steps) * i;
      gridLines.push(
        <line
          key={i}
          x1={0}
          y1={y}
          x2={chartWidth}
          y2={y}
          stroke="rgb(55, 65, 81)"
          strokeWidth={1}
          opacity={0.3}
        />
      );
    }

    return gridLines;
  };

  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50 ${className}`}>
      <svg width={chartWidth} height={height} className="overflow-visible">
        {renderGrid()}
        {type === 'bar' && renderBars()}
      </svg>
    </div>
  );
};

export default TeslaChart;
