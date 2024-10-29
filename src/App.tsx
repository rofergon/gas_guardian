import { Activity, Clock } from 'lucide-react';
import Header from './components/layout/Header';
import StatCard from './components/dashboard/StatCard';
import GasChart from './components/dashboard/GasChart';
import PredictionCard from './components/predictions/PredictionCard';
import AlertsPanel from './components/alerts/AlertsPanel';
import ContractAnalysis from './components/analysis/ContractAnalysis';
import { useGasData } from './hooks/useGasData';
import { useTheme } from './hooks/useTheme';

function App() {
  const { currentGwei, predictedLow, gasData, networkActivity } = useGasData();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Current Gas"
            value={`${currentGwei} Gwei`}
            subtitle="Live price"
            icon={Activity}
            iconColor={isDark ? "text-green-500" : "text-green-600"}
            trend={{ value: '+12%', direction: 'up' }}
          />
          <StatCard
            title="Predicted Low"
            value={`${predictedLow} Gwei`}
            subtitle="Next 2 hours"
            icon={Clock}
            iconColor={isDark ? "text-blue-500" : "text-blue-600"}
            trend={{ value: '-15%', direction: 'down' }}
          />
          <StatCard
            title="Network Activity"
            value={`${networkActivity}%`}
            subtitle="Current load"
            icon={Activity}
            iconColor={isDark ? "text-purple-500" : "text-purple-600"}
            progress={{
              value: networkActivity,
              color: networkActivity > 80 ? 'bg-red-500' : networkActivity > 50 ? 'bg-yellow-500' : 'bg-green-500'
            }}
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className={`${isDark ? 'bg-slate-800/50' : 'bg-white'} backdrop-blur-sm p-6 rounded-xl ${isDark ? 'border-slate-700/50' : 'border-slate-200'} border shadow-lg`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Gas Price Trends</h2>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>24-hour price history with real-time updates</p>
                </div>
                <div className="flex gap-2">
                  <button className={`px-3 py-1 text-sm ${isDark ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'} rounded-lg transition-colors`}>
                    24H
                  </button>
                  <button className={`px-3 py-1 text-sm ${isDark ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-slate-200 hover:bg-slate-300'} rounded-lg transition-colors`}>
                    1W
                  </button>
                </div>
              </div>
              <GasChart data={gasData} />
            </div>

            <div className={`${isDark ? 'bg-slate-800/50' : 'bg-white'} backdrop-blur-sm p-6 rounded-xl ${isDark ? 'border-slate-700/50' : 'border-slate-200'} border shadow-lg`}>
              <ContractAnalysis />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <PredictionCard predictedDrop={15} optimalTime="2:00 AM" />
            <AlertsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;