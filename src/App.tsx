import { Activity, Clock, Wallet } from 'lucide-react';
import Header from './components/layout/Header';
import StatCard from './components/dashboard/StatCard';
import { useBlockDataChart } from './hooks/useBlockDataChart';
import { useTheme } from './hooks/useTheme';

function App() {
  const { chartData, loading } = useBlockDataChart();
  const { isDark } = useTheme();

  const defaultData = {
    price: 0,
    predictedLow: 0,
    networkActivity: 0,
    utilizationPercent: 0,
    totalTransactions: 0,
    totalValueTransferred: 0
  };

  const latestData = chartData?.[chartData.length - 1] ?? defaultData;

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
    <div className={`min-h-screen flex flex-col ${
      isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <Header />

      <main className="flex-1 container mx-auto px-4 pt-20 pb-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gas Price"
            value={`${latestData.price.toFixed(2)} Gwei`}
            subtitle="Current base fee"
            icon={Activity}
            iconColor={isDark ? "text-green-500" : "text-green-600"}
          />
          <StatCard
            title="Network Load"
            value={`${latestData.utilizationPercent.toFixed(1)}%`}
            subtitle="Block utilization"
            icon={Activity}
            iconColor={isDark ? "text-blue-500" : "text-blue-600"}
          />
          <StatCard
            title="Transactions"
            value={latestData.totalTransactions.toString()}
            subtitle="Last block"
            icon={Clock}
            iconColor={isDark ? "text-purple-500" : "text-purple-600"}
          />
          <StatCard
            title="Value Transferred"
            value={`${latestData.totalValueTransferred.toFixed(2)} ETH`}
            subtitle="Last block"
            icon={Wallet}
            iconColor={isDark ? "text-orange-500" : "text-orange-600"}
          />
        </div>
      </main>
    </div>
  );
}

export default App;