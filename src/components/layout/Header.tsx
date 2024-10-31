import React, { memo } from 'react';
import { Bell, Flame, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAccount } from 'wagmi';

const Header: React.FC = memo(() => {
  const { isDark, toggleTheme } = useTheme();
  const { isConnected } = useAccount();

  return (
    <nav className={`fixed w-full top-0 z-50 border-b ${
      isDark 
        ? 'border-slate-700/50 bg-slate-900/80' 
        : 'border-slate-200 bg-white/80'
    } backdrop-blur-xl`}>
      <div className="max-w-8xl mx-auto pl-2 pr-4 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y nombre */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r ${
              isDark 
                ? 'from-blue-400 to-blue-600' 
                : 'from-blue-600 to-blue-800'
            } text-transparent bg-clip-text`}>
              Gas Guardian
            </span>
          </div>

          {/* Botones y controles */}
          <div className="flex items-center space-x-2">
            <w3m-button />
            {isConnected && (
              <div className={`flex items-center ml-2 p-1 rounded-lg ${
                isDark ? 'bg-slate-800/50' : 'bg-slate-100'
              }`}>
                <button 
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className={`p-2 rounded-md ${
                    isDark 
                      ? 'hover:bg-slate-700 text-slate-300 hover:text-white' 
                      : 'hover:bg-white text-slate-600 hover:text-slate-900'
                  } transition-all duration-200`}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button 
                  type="button"
                  aria-label="Notifications"
                  className={`p-2 rounded-md ${
                    isDark 
                      ? 'hover:bg-slate-700 text-slate-300 hover:text-white' 
                      : 'hover:bg-white text-slate-600 hover:text-slate-900'
                  } transition-all duration-200`}
                >
                  <Bell className="w-5 h-5" />
                </button>
                <button 
                  type="button" 
                  aria-label="Settings"
                  className={`p-2 rounded-md ${
                    isDark 
                      ? 'hover:bg-slate-700 text-slate-300 hover:text-white' 
                      : 'hover:bg-white text-slate-600 hover:text-slate-900'
                  } transition-all duration-200`}
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
});

export default Header;