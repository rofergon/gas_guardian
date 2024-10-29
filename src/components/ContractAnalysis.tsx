import React from 'react';
import { Code2, TrendingDown } from 'lucide-react';

const ContractAnalysis: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-700/30 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Code2 className="w-5 h-5 text-blue-500 mr-2" />
              <h3 className="font-semibold">Uniswap V3</h3>
            </div>
            <span className="text-green-500 text-sm">Efficient</span>
          </div>
          <p className="text-sm text-slate-300 mb-2">Average Gas: 150,000</p>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
          </div>
        </div>

        <div className="bg-slate-700/30 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Code2 className="w-5 h-5 text-purple-500 mr-2" />
              <h3 className="font-semibold">OpenSea</h3>
            </div>
            <span className="text-yellow-500 text-sm">Moderate</span>
          </div>
          <p className="text-sm text-slate-300 mb-2">Average Gas: 250,000</p>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        <div className="bg-slate-700/30 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Code2 className="w-5 h-5 text-red-500 mr-2" />
              <h3 className="font-semibold">Custom Contract</h3>
            </div>
            <span className="text-red-500 text-sm">High Usage</span>
          </div>
          <p className="text-sm text-slate-300 mb-2">Average Gas: 350,000</p>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-700/30 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Optimization Suggestions</h3>
        <div className="space-y-2">
          <div className="flex items-start">
            <TrendingDown className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
            <p className="text-sm text-slate-300">Consider using Uniswap V3 for token swaps as it's 40% more gas efficient than alternatives.</p>
          </div>
          <div className="flex items-start">
            <TrendingDown className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
            <p className="text-sm text-slate-300">Batch multiple NFT transactions to save up to 25% on gas fees.</p>
          </div>
          <div className="flex items-start">
            <TrendingDown className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
            <p className="text-sm text-slate-300">Use Layer 2 solutions for smaller transactions to reduce gas costs by up to 90%.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractAnalysis;