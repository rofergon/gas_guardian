import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { format } from 'date-fns';
import { TimeRange } from '../../hooks/useBlockDataChart';

interface ChartData {
  time: string;
  price?: number;
  networkLoad?: number;
  transactions?: number;
  valueTransferred?: number;
  [key: string]: string | number | undefined;
}

interface ChartDisplayProps {
  selectedChart: string;
  formattedChartData: ChartData[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
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
    data: formattedChartData,
    height: 400,
    xField: 'time',
    yField: selectedChart,
    smooth: true,
    animation: false,
    color: isDark ? "#22c55e" : "#16a34a",
    xAxis: {
      label: {
        formatter: (v: string) => v
      }
    },
    tooltip: {
      formatter: (data: ChartData) => {
        return { name: selectedChart, value: data[selectedChart] };
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          {selectedChart} History
        </h3>
        <div className="flex gap-2 items-center">
          {timeRanges.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onTimeRangeChange(value as TimeRange)}
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
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={formattedChartData}
          margin={{ right: 30, left: 20, top: 10, bottom: 10 }}
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
            stroke={chartConfig.color}
            strokeWidth={2}
            dot={false}
            name={selectedChart}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};