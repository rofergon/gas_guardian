import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { format } from 'date-fns';
import { TimeRange } from '../../hooks/useBlockDataChart';


interface ChartDisplayProps {
  selectedChart: string;
  formattedChartData: {
    time: string;
    price: number;
    networkLoad: number;
    transactions: number;
    valueTransferred: number;
    blockNumber: number;
  }[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  currentBlockNumber?: number;
}

export const ChartDisplay = ({ 
  selectedChart = 'price',
  formattedChartData, 
  timeRange, 
  onTimeRangeChange,
  currentBlockNumber = 0
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

  const getChartTitle = () => {
    const titles = {
      'price': 'Gas Price History',
      'networkLoad': 'Network Load History',
      'transactions': 'Transactions History',
      'valueTransferred': 'Value Transferred History'
    };
    return titles[selectedChart as keyof typeof titles] || 'Chart History';
  };

  const getChartColor = () => {
    const colors = {
      'price': '#22c55e',
      'networkLoad': '#3b82f6',
      'transactions': '#a855f7',
      'valueTransferred': '#f97316'
    };
    return colors[selectedChart as keyof typeof colors] || '#22c55e';
  };

  const handleClick = (data: {
    activePayload?: Array<{
      payload: {
        blockNumber: number;
      };
    }>;
  }) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const blockNumber = data.activePayload[0].payload.blockNumber;
      window.open(`https://etherscan.io/block/${blockNumber}`, '_blank');
    }
  };

  return (
    <div className={`${
      isDark ? 'bg-slate-800/50' : 'bg-white/95'
    } backdrop-blur-sm p-4 rounded-xl border ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`text-lg font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {getChartTitle()}
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Block #{currentBlockNumber}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Real Time Data Streaming
              </span>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-fast" />
            </div>
          </div>
        </div>
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
          onClick={handleClick}
        >
          <rect
            x={0}
            y={0}
            width="100%"
            height="100%"
            fill={isDark ? '#1e293b' : '#ffffff'}
          />
          <CartesianGrid 
            strokeDasharray="3 3"
            stroke={isDark ? "#334155" : "#e2e8f0"}
            vertical={false}
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
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-lg border border-slate-200/20 cursor-pointer`}>
                    <p className="text-sm text-slate-400">{data.time}</p>
                    <p className="text-sm font-medium hover:text-blue-500">
                      Block: {data.blockNumber}
                    </p>
                    <p className="text-sm font-medium">
                      {selectedChart}: {payload[0].value}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click para ver en Etherscan
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey={selectedChart}
            stroke={getChartColor()}
            strokeWidth={2}
            dot={false}
            name={selectedChart}
            fill={`url(#${selectedChart})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};