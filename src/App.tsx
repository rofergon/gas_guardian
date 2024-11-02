import { Activity, Clock, Wallet } from 'lucide-react';
import Header from './components/layout/Header';
import StatCard from './components/dashboard/StatCard';
import { TimeRange, useBlockDataChart } from './hooks/useBlockDataChart';
import { useTheme } from './hooks/useTheme';
import { useState } from 'react';
import { ChartDisplay } from './components/dashboard/ChartDisplay';
import PredictionCard from './components/predictions/PredictionCardAI';
import WhalesLeaderboard from './components/whales/WhalesLeaderboard';
import { useWhalesData } from './hooks/useWhalesData';
import CustomAlerts from './components/alerts/CustomAlerts';
import { Toaster } from 'react-hot-toast';
import CustomPromptChat from './components/predictions/CustomPromptChat';
import AddressTracker from './components/address/AddressTracker';

interface ChartDataItem {
  time: string;
  price: number;
  utilizationPercent: number;
  totalTransactions: number;
  totalValueTransferred: number;
  blockNumber: number;
}

function App() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const { chartData, loading } = useBlockDataChart(timeRange as '2h' | '4h' | '8h' | '24h' | '1w');
  const { isDark } = useTheme();
  const [selectedChart, setSelectedChart] = useState<string | null>('price');
  useWhalesData();

  const defaultData = {
    price: 0,
    predictedLow: 0,
    networkActivity: 0,
    utilizationPercent: 0,
    totalTransactions: 0,
    totalValueTransferred: 0
  };

  const latestData = chartData?.[chartData.length - 1] ?? defaultData;

  const formatChartData = (data: ChartDataItem[]) => {
    const formatted = data.map(item => ({
      time: new Date(item.time).toLocaleTimeString(),
      price: Number(item.price),
      networkLoad: Number(item.utilizationPercent),
      transactions: Number(item.totalTransactions),
      valueTransferred: Number(item.totalValueTransferred),
      blockNumber: Number(item.blockNumber)
    }));
    
    return formatted;
  };

  const formattedChartData = formatChartData(chartData);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${
        isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
      }`}>
        <Header />
        <main className="flex-1 container mx-auto px-4 pt-20 pb-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              ))}
            </div>
            <div className="h-[400px] bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1a1b1e',
            color: '#fff',
          },
        }}
      />
      <div className={`min-h-screen flex flex-col ${
        isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
      }`}>
        <Header />

        <main className="flex-1 mx-[50px] lg:mx-[100px] xl:mx-[150px] pt-20 pb-6">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
              <StatCard
                title="Gas Price"
                value={`${latestData.price.toFixed(2)} Gwei`}
                subtitle="Current base fee"
                icon={Activity}
                iconColor={isDark ? "text-green-500" : "text-green-600"}
                chartData={selectedChart === 'price' ? formattedChartData : undefined}
                dataKey="price"
                onClick={() => setSelectedChart(selectedChart === 'price' ? null : 'price')}
              />
              <StatCard
                title="Network Load"
                value={`${latestData.utilizationPercent.toFixed(1)}%`}
                subtitle="Block utilization"
                icon={Activity}
                iconColor={isDark ? "text-blue-500" : "text-blue-600"}
                chartData={selectedChart === 'networkLoad' ? formattedChartData : undefined}
                dataKey="networkLoad"
                onClick={() => setSelectedChart(selectedChart === 'networkLoad' ? null : 'networkLoad')}
              />
              <StatCard
                title="Transactions"
                value={latestData.totalTransactions.toString()}
                subtitle="Last block"
                icon={Clock}
                iconColor={isDark ? "text-purple-500" : "text-purple-600"}
                chartData={selectedChart === 'transactions' ? formattedChartData : undefined}
                dataKey="transactions"
                onClick={() => setSelectedChart(selectedChart === 'transactions' ? null : 'transactions')}
              />
              <StatCard
                title="Value Transferred"
                value={`${latestData.totalValueTransferred.toFixed(2)} ETH`}
                subtitle="Last block"
                icon={Wallet}
                iconColor={isDark ? "text-orange-500" : "text-orange-600"}
                chartData={selectedChart === 'valueTransferred' ? formattedChartData : undefined}
                dataKey="valueTransferred"
                onClick={() => setSelectedChart(selectedChart === 'valueTransferred' ? null : 'valueTransferred')}
              />
            </div>

            <div className="flex flex-row gap-6">
              <div className="flex-1 space-y-6">
                <ChartDisplay 
                  selectedChart={selectedChart || 'price'} 
                  formattedChartData={formattedChartData}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                  currentBlockNumber={latestData.blockNumber}
                />
                <WhalesLeaderboard />
              </div>

              <div className="w-[350px] shrink-0 space-y-6">
                <PredictionCard gasData={formattedChartData.map(item => ({
                  time: item.time,
                  price: item.price,
                  predictedLow: 0,
                  networkActivity: item.networkLoad,
                  gasUsed: 0,
                  utilizationPercent: item.networkLoad,
                  totalTransactions: item.transactions,
                  totalValueTransferred: item.valueTransferred,
                  blockNumber: 0,
                  baseFee: item.price,
                  priorityFee: 0,
                  burntFees: 0,
                  rewards: 0,
                  eip1559Transactions: 0,
                  legacyTransactions: 0,
                  networkCongestion: 'low',
                  networkTrend: 'stable' as const,
                  predictedHigh: 0,
                  predictedMedian: 0,
                  confidence: 0,
                  avgGasPrice: 0,
                  medianGasPrice: 0,
                  avgPriorityFee: 0,
                  medianPriorityFee: 0
                }))} />
                <CustomPromptChat gasData={formattedChartData.map(item => ({
                  time: item.time,
                  price: item.price,
                  predictedLow: 0,
                  networkActivity: item.networkLoad,
                  gasUsed: 0,
                  utilizationPercent: item.networkLoad,
                  totalTransactions: item.transactions,
                  totalValueTransferred: item.valueTransferred,
                  blockNumber: 0,
                  baseFee: item.price,
                  priorityFee: 0,
                  burntFees: 0,
                  rewards: 0,
                  eip1559Transactions: 0,
                  legacyTransactions: 0,
                  networkCongestion: 'low',
                  networkTrend: 'stable' as const,
                  predictedHigh: 0,
                  predictedMedian: 0,
                  confidence: 0,
                  avgGasPrice: 0,
                  medianGasPrice: 0,
                  avgPriorityFee: 0,
                  medianPriorityFee: 0
                }))} />
                <CustomAlerts />
                <AddressTracker />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;