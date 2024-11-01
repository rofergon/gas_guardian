import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { format } from 'date-fns';

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
}

export const ChartDisplay = ({ selectedChart, formattedChartData }: ChartDisplayProps) => {
  const { isDark } = useTheme();

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

  if (!selectedChart || !formattedChartData) return null;

  return (
    <div className={`mt-6 ${isDark ? 'bg-slate-800/50' : 'bg-white'} p-6 rounded-xl h-[400px] shadow-sm`}>
      <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
        {chartConfig?.label} History
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedChartData}>
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
            interval="preserveStartEnd"
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};