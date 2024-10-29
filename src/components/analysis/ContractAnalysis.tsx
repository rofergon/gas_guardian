import React from 'react';
import { Code2, TrendingDown, AlertTriangle } from 'lucide-react';

interface Contract {
  name: string;
  status: 'Efficient' | 'Moderate' | 'High Usage';
  gasUsage: number;
  percentage: number;
  color: string;
  statusColor: string;
}

const contracts: Contract[] = [
  {
    name: 'Uniswap V3',
    status: 'Efficient',
    gasUsage: 150000,
    percentage: 35,
    color: 'bg-blue-500',
    statusColor: 'text-green-500'
  },
  {
    name: 'OpenSea',
    status: 'Moderate',
    gasUsage: 250000,
    percentage: 65,
    color: 'bg-purple-500',
    statusColor: 'text-yellow-500'
  },
  {
    name: 'Custom Contract',
    status: 'High Usage',
    gasUsage: 350000,
    percentage: 85,
    color: 'bg-red-500',
    statusColor: 'text-red-500'
  }
];

const ContractAnalysis: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contracts.map((contract, index) => (
          <div key={index} className="bg-slate-700/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Code2 className={`w-5 h-5 ${contract.color.replace('bg-', 'text-')} mr-2`} />
                <h3 className="font-semibold">{contract.name}</h3>
              </div>
              <span className={`${contract.statusColor} text-sm`}>{contract.status}</span>
            </div>
            <p className="text-sm text-slate-300 mb-2">Average Gas: {contract.gasUsage.toLocaleString()}</p>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div className={`${contract.color} h-2 rounded-full`} style={{ width: `${contract.percentage}%` }}></div>
            </div>
          </div>
        ))}
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
            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
            <p className="text-sm text-slate-300">Your custom contract shows high gas usage. Consider implementing ERC721A for NFT minting to reduce costs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractAnalysis;