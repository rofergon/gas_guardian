import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { useQuickNode } from '../../hooks/useQuickNode';
import { gasHistoryService } from '../../services/gasHistoryService';

interface GasDataPoint {
  timestamp: string;
  gasUsed: number;
}

interface GasHistoryRecord {
  timestamp: string;
  total_gas_used: number;
}

const GasAnalysisChart: React.FC = () => {
  const { isDark } = useTheme();
  const { fetchBlockData } = useQuickNode();
  const [gasData, setGasData] = useState<GasDataPoint[]>([]);

  const fetchAndSaveGasData = async () => {
    try {
      const latestBlock = await fetchBlockData('latest');
      if (latestBlock?.data) {
        const blockNumber = parseInt(latestBlock.data.number, 16);
        const totalGasUsed = parseInt(latestBlock.data.gasUsed, 16);
        
        await gasHistoryService.saveGasData(blockNumber, totalGasUsed);
        loadGasHistory();
      }
    } catch (error) {
      console.error('Error fetching block data:', error);
    }
  };

  const loadGasHistory = async () => {
    try {
      const history = await gasHistoryService.getLastHourData();
      setGasData(history.map((row: GasHistoryRecord) => ({
        timestamp: new Date(row.timestamp).toLocaleTimeString(),
        gasUsed: row.total_gas_used
      })));
    } catch (error) {
      console.error('Error loading gas history:', error);
    }
  };

  useEffect(() => {
    loadGasHistory();
    
    const interval = setInterval(fetchAndSaveGasData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`p-4 rounded-xl border ${
      isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/95 border-slate-200'
    }`}>
      <h2 className="text-lg font-semibold mb-4">Gas Usage Analysis</h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={gasData}>
            <XAxis 
              dataKey="timestamp" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="gasUsed" 
              stroke="#6366f1" 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GasAnalysisChart;