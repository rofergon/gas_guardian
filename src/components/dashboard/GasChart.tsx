import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceArea, ReferenceLine } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { format } from 'date-fns';

interface GasChartProps {
  data: Array<{
    time: string;
    price: number;
    predictedLow: number;
  }>;
}

const GasChart: React.FC<GasChartProps> = ({ data }) => {
  const { isDark } = useTheme();
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [left, setLeft] = useState('dataMin');
  const [right, setRight] = useState('dataMax');
  const [top] = useState('dataMax+1');
  const [bottom] = useState('dataMin-1');

  const zoom = () => {
    if (refAreaLeft === refAreaRight || !refAreaRight) {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }

    // xAxis domain
    if (refAreaLeft > refAreaRight) {
      setRefAreaLeft(refAreaRight);
      setRefAreaRight(refAreaLeft);
    }

    setLeft(refAreaLeft);
    setRight(refAreaRight);
    setRefAreaLeft('');
    setRefAreaRight('');
  };

  const formatTime = (timeString: string) => {
    try {
      // Si ya está en formato HH:mm, convertirlo a fecha completa del día actual
      if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
        const [hours, minutes] = timeString.split(':');
        const today = new Date();
        today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return format(today, 'HH:mm');
      }

      // Para otros formatos de fecha
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return timeString;
      }

      // Ajustar a la zona horaria local
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      return format(localDate, 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error, timeString);
      return timeString;
    }
  };

  // Para debug - imprimir el primer elemento de data
  console.log('Sample data time:', data?.[0]?.time);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className={`text-${isDark ? 'slate-400' : 'slate-600'}`}>
          Loading gas data...
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          onMouseDown={(e) => e?.activeLabel && setRefAreaLeft(e.activeLabel || '')}
          onMouseMove={(e) => refAreaLeft && e?.activeLabel && setRefAreaRight(e.activeLabel || '')}
          onMouseUp={zoom}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
          <XAxis 
            dataKey="time" 
            domain={[left, right]} 
            tickFormatter={formatTime}
          />
          <YAxis 
            domain={[bottom, top]}
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
          
          <ReferenceLine
            y={data[data.length - 1]?.price}
            stroke="#3b82f6"
            strokeDasharray="3 3"
            label={{
              value: 'Current',
              position: 'right',
              fill: isDark ? '#94a3b8' : '#64748b'
            }}
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
    </div>
  );
};

export default GasChart;