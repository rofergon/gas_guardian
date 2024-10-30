import React from 'react';
import { Bell, Flame, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAccount } from 'wagmi'

const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isConnected } = useAccount();

  return (
    <nav className={`border-b ${isDark ? 'border-slate-700/50 bg-slate-900/50' : 'border-slate-200 bg-white/50'} backdrop-blur-xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Flame className="w-8 h-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold">Gas Guardian</span>
          </div>
          <div className="flex items-center space-x-4">
            <w3m-button />
            {isConnected && (
              <>
                <button 
                  type="button"
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-200'} transition-colors`}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button 
                  type="button"
                  aria-label="Notifications"
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-200'} transition-colors`}
                >
                  <Bell className="w-5 h-5" />
                </button>
                <button 
                  type="button" 
                  aria-label="Settings"
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-200'} transition-colors`}
                >
                  <Settings className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;