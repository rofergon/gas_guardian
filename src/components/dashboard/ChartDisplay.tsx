import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceArea } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { format } from 'date-fns';
import { useState } from 'react';

interface ChartData {
  time: string;
  price?: number;
  networkLoad?: number;
  transactions?: number;
  valueTransferred?: number;
}

interface ChartDisplayProps {
  selectedChart: string;
  formattedChartData: ChartData[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export const ChartDisplay = ({ 
  selectedChart, 
  formattedChartData, 
  timeRange, 
  onTimeRangeChange 
}: ChartDisplayProps) => {
  const { isDark } = useTheme();

  const timeRanges = [
    { value: '2h', label: '2H' },
    { value: '4h', label: '4H' },
    { value: '8h', label: '8H' },
    { value: '24h', label: '24H' },
    { value: '1w', label: '1W' },
  ];

  const formatXAxisTick = (timestamp: string) => {
    try {
      // Asumiendo que timestamp viene en formato "YYYY-MM-DD HH:mm:ss"
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return timestamp;
    }
  };

  const chartConfig = {
    price: {
      color: isDark ? "#22c55e" : "#16a34a",
      label: "Gas Price (Gwei)",
      gradient: "gasPrice"
    },
    networkLoad: {
      color: isDark ? "#3b82f6" : "#2563eb",
      label: "Network Load (%)",
      gradient: "networkLoad"
    },
    transactions: {
      color: isDark ? "#a855f7" : "#9333ea",
      label: "Transactions",
      gradient: "transactions"
    },
    valueTransferred: {
      color: isDark ? "#f97316" : "#ea580c",
      label: "Value (ETH)",
      gradient: "valueTransferred"
    }
  }[selectedChart];

  const [zoomState, setZoomState] = useState({
    left: '',
    right: '',
    refAreaLeft: '',
    refAreaRight: '',
    data: formattedChartData,
    isZooming: false
  });

  const getAxisYDomain = (from: number, to: number, dataKey: string) => {
    const refData = formattedChartData.slice(from, to);
    let [bottom, top] = [Infinity, -Infinity];
    
    refData.forEach((d) => {
      const value = d[dataKey as keyof ChartData] as number;
      if (value > top) top = value;
      if (value < bottom) bottom = value;
    });

    return [(bottom | 0) - 1, (top | 0) + 1];
  };

  const zoom = () => {
    let { refAreaLeft, refAreaRight } = zoomState;
    if (refAreaLeft === refAreaRight || !refAreaRight) {
      setZoomState({
        ...zoomState,
        refAreaLeft: '',
        refAreaRight: ''
      });
      return;
    }

    // Asegurarse de que left es menor que right
    if (refAreaLeft > refAreaRight) {
      [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
    }

    const [left, right] = [
      formattedChartData.findIndex(item => item.time === refAreaLeft),
      formattedChartData.findIndex(item => item.time === refAreaRight)
    ];

    setZoomState({
      ...zoomState,
      refAreaLeft: '',
      refAreaRight: '',
      data: formattedChartData.slice(left, right + 1),
      left: formattedChartData[left].time,
      right: formattedChartData[right].time,
    });
  };

  if (!selectedChart || !formattedChartData) return null;

  return (
    <div className={`mt-6 ${isDark ? 'bg-slate-800/50' : 'bg-white'} p-6 rounded-xl h-[500px] shadow-sm`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          {chartConfig?.label} History
        </h3>
        <div className="flex gap-2 items-center">
          {zoomState.data !== formattedChartData && (
            <button
              onClick={() => setZoomState({
                ...zoomState,
                data: formattedChartData,
                left: '',
                right: '',
                refAreaLeft: '',
                refAreaRight: '',
                isZooming: false
              })}
              className={`px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600`}
            >
              Reset Zoom
            </button>
          )}
          {timeRanges.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onTimeRangeChange(value)}
              className={`px-3 py-1 rounded ${
                timeRange === value
                  ? isDark 
                    ? 'bg-slate-600 text-white' 
                    : 'bg-slate-200 text-slate-800'
                  : isDark
                    ? 'text-slate-400 hover:bg-slate-700'
                    : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={560}>
        <LineChart
          data={zoomState.data}
          margin={{ right: 30, left: 20, top: 10, bottom: 130 }}
          onMouseDown={e => {
            if (!e) return;
            setZoomState({
              ...zoomState,
              refAreaLeft: e.activeLabel || '',
              isZooming: true
            });
          }}
          onMouseMove={e => {
            if (!e || !zoomState.isZooming) return;
            setZoomState({
              ...zoomState,
              refAreaRight: e.activeLabel || ''
            });
          }}
          onMouseUp={zoom}
        >
          <CartesianGrid 
            strokeDasharray="3 3"  // Hace la línea punteada
            stroke={isDark ? "#334155" : "#e2e8f0"}  // Color de la cuadrícula según el tema
            vertical={false}  // Opcional: si solo quieres líneas horizontales
          />
          <defs>
            <linearGradient id="gasPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="networkLoad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="transactions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="valueTransferred" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke={isDark ? "#94a3b8" : "#475569"}
            fontSize={12}
            tickFormatter={formatXAxisTick}
            interval={Math.ceil(formattedChartData.length / 14)}
            angle={-15}
            textAnchor="end"
            height={60}
            dy={10}
          />
          <YAxis 
            stroke={isDark ? "#94a3b8" : "#475569"}
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: isDark ? 'none' : '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{
              color: isDark ? '#94a3b8' : '#475569',
            }}
            itemStyle={{
              color: isDark ? '#ffffff' : '#1e293b',
            }}
          />
          <Line
            type="monotone"
            dataKey={selectedChart}
            stroke={chartConfig?.color}
            strokeWidth={2}
            dot={false}
            name={chartConfig?.label}
          />
          {zoomState.refAreaLeft && zoomState.refAreaRight ? (
            <ReferenceArea
              x1={zoomState.refAreaLeft}
              x2={zoomState.refAreaRight}
              strokeOpacity={0.3}
              fill={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};