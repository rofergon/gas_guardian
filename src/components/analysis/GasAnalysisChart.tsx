import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import { useQuickNode } from '../../hooks/useQuickNode';
import { gasHistoryService } from '../../services/gasHistoryService';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

interface GasDataPoint {
  timestamp: string;
  gasUsed: number;
  gasInEth: number;
  blockNumber: number;
}

interface GasHistoryRecord {
  timestamp: string;
  total_gas_used: number;
  block_number: number;
}

// Definimos la animación del LED
const pulse = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
`;

// Creamos el componente LED
const LiveIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ef4444;
  animation: ${pulse} 2s ease-in-out infinite;
  margin-left: 8px;
  display: inline-block;
`;

const GasAnalysisChart: React.FC = () => {
  const { isDark } = useTheme();
  const { fetchBlockData } = useQuickNode();
  const [gasData, setGasData] = useState<GasDataPoint[]>([]);

  const convertGasToEth = (gasValue: number): number => {
    const gweiToEth = 1e-9; // 1 Gwei = 10^-9 ETH
    const gasPrice = 30; // Precio promedio en Gwei (puedes ajustar este valor o hacerlo dinámico)
    return (gasValue * gasPrice * gweiToEth);
  };

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
        gasUsed: row.total_gas_used,
        gasInEth: convertGasToEth(row.total_gas_used),
        blockNumber: row.block_number
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
          <div className="text-sm text-slate-500 flex items-center">
            Total Block Fee in ETH
            <LiveIndicator />
          </div>
          <div className="text-xl font-semibold">
            {gasData.length > 0 ? gasData[gasData.length - 1].gasInEth.toFixed(6) : '0'} ETH
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Block #{gasData.length > 0 ? gasData[gasData.length - 1].blockNumber : '0'}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
          <div className="text-sm text-slate-500 flex items-center">
            Gas Used
            <LiveIndicator />
          </div>
          <div className="text-xl font-semibold">
            {gasData.length > 0 ? gasData[gasData.length - 1].gasUsed.toLocaleString() : '0'} Gas
          </div>
        </div>
      </div>
      
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
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(6)} ETH`, 'Block Fee']}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="gasInEth" 
              stroke="#10b981" 
              dot={false}
              name="Block Fee"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GasAnalysisChart;