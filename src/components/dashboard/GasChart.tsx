import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceArea } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface GasChartProps {
  data: Array<{
    time: string;
    price: number;
    predictedLow: number;
  }>;
}

interface HoveredDataType {
  time: string;
  price: number;
  predictedLow: number;
}

const GasChart: React.FC<GasChartProps> = ({ data }) => {
  const { isDark } = useTheme();
  const [hoveredData, setHoveredData] = useState<HoveredDataType | null>(null);
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [timeRange, setTimeRange] = useState({
    left: 'dataMin',
    right: 'dataMax',
    top: 'dataMax+1',
    bottom: 'dataMin-1'
  });

  const formatTime = (timeString: string) => {
    try {
          // Start of Selection
          const date = new Date(timeString);
          return format(date, 'HH:mm');
        } catch {
          return timeString;
        }
      };

  const handleZoom = () => {
    if (refAreaLeft === refAreaRight || !refAreaRight) {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }

    if (refAreaLeft > refAreaRight) {
      setTimeRange({
        ...timeRange,
        left: refAreaRight,
        right: refAreaLeft
      });
    } else {
      setTimeRange({
        ...timeRange,
        left: refAreaLeft,
        right: refAreaRight
      });
    }

    setRefAreaLeft('');
    setRefAreaRight('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative h-[400px]"
    >
      <ResponsiveContainer>
        <LineChart
          data={data}
          onMouseDown={e => setRefAreaLeft(e?.activeLabel || '')}
          onMouseMove={e => {
            if (e?.activePayload) {
              setHoveredData(e.activePayload[0].payload);
            }
            if (refAreaLeft) {
              setRefAreaRight(e?.activeLabel || '');
            }
          }}
          onMouseLeave={() => setHoveredData(null)}
          onMouseUp={handleZoom}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
          <XAxis 
            dataKey="time" 
            domain={[timeRange.left, timeRange.right]} 
            tickFormatter={formatTime}
          />
          <YAxis 
            domain={[timeRange.bottom, timeRange.top]}
            tickFormatter={(value) => Number(value).toFixed(2)}
            width={65}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '8px',
            }}
            labelStyle={{ color: isDark ? '#94a3b8' : '#64748b' }}
            formatter={(value: number) => [Number(value).toFixed(2), 'Price']}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="predictedLow" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />
          
          <Brush
            dataKey="time"
            height={30}
            stroke={isDark ? '#475569' : '#cbd5e1'}
            fill={isDark ? '#1e293b' : '#f8fafc'}
            tickFormatter={formatTime}
          />
          
          {refAreaLeft && refAreaRight ? (
            <ReferenceArea
              x1={refAreaLeft}
              x2={refAreaRight}
              strokeOpacity={0.3}
              fill={isDark ? '#475569' : '#e2e8f0'}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
      
      {hoveredData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            absolute top-0 right-0 p-4 rounded-lg
            ${isDark ? 'bg-slate-800' : 'bg-white'}
            shadow-lg border border-slate-200
          `}
        >
          <div className="space-y-2">
            <p className="text-sm text-slate-500">
              Time: {formatTime(hoveredData.time)}
            </p>
            <p className="text-sm font-medium">
              Price: {Number(hoveredData.price).toFixed(2)} Gwei
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GasChart;