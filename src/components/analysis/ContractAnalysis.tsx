import React, { useState } from 'react';
import { Code2, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { ethers } from 'ethers';

interface Contract {
  name: string;
  averageGas: number;
  efficiency: 'Efficient' | 'Moderate' | 'Inefficient';
  color: string;
  statusColor: string;
  status: string;
  gasUsage: number;
  percentage: number;
}

// Add this interface for saved contracts
interface SavedContract {
  name: string;
  averageGas: number;
  efficiency: 'Efficient' | 'Moderate' | 'Inefficient';
  gasUsage: number;
  percentage: number;
}

// Move the getContractDisplayProperties function before its use
const getContractDisplayProperties = (efficiency: Contract['efficiency']) => {
  switch (efficiency) {
    case 'Efficient':
      return {
        color: 'bg-green-500',
        statusColor: 'text-green-500',
        status: 'Efficient'
      };
    case 'Moderate':
      return {
        color: 'bg-yellow-500',
        statusColor: 'text-yellow-500',
        status: 'Moderate'
      };
    case 'Inefficient':
      return {
        color: 'bg-red-500',
        statusColor: 'text-red-500',
        status: 'Inefficient'
      };
  }
};

const ContractAnalysis: React.FC = () => {
  const { isDark } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContract, setNewContract] = useState({
    address: '',
    name: ''
  });
  const [contracts, setContracts] = useState<Contract[]>(() => {
    try {
      const savedContracts = localStorage.getItem('savedContracts');
      
      if (!savedContracts) {
        return [];
      }

      const parsedContracts = JSON.parse(savedContracts) as SavedContract[];
      
      const contractsWithDisplay = parsedContracts.map((contract: SavedContract) => {
        const efficiency = contract.efficiency || 'Moderate';
        const displayProps = getContractDisplayProperties(efficiency);
        
        return {
          ...contract,
          ...displayProps
        };
      });

      return contractsWithDisplay;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return [];
    }
  });

  const getWidthClass = (percentage: number): string => {
    return `w-[${Math.min(percentage, 100)}%]`;
  };

  const handleAddContract = async () => {
    if (!ethers.isAddress(newContract.address)) {
      alert('Invalid address');
      return;
    }

    try {
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_QUICKNODE_HTTP_URL);
      
      
      const gasEstimate = await provider.estimateGas({
        to: newContract.address,
        data: '0x70a08231'
      });

      // Convertir el BigInt a número
      const gasUsage = Number(gasEstimate);
      const percentage = (gasUsage / 400000) * 100;
      
      const efficiency: Contract['efficiency'] = 
        gasUsage < 200000 ? 'Efficient' :
        gasUsage < 300000 ? 'Moderate' : 'Inefficient';

      const newContractData: Contract = {
        name: newContract.name || `Contract ${contracts.length + 1}`,
        averageGas: gasUsage,
        efficiency,
        gasUsage: gasUsage,
        percentage: percentage,
        color: getContractDisplayProperties(efficiency).color,
        statusColor: getContractDisplayProperties(efficiency).statusColor,
        status: getContractDisplayProperties(efficiency).status
      };

      addContract(newContractData);
      setIsModalOpen(false);
      setNewContract({ address: '', name: '' });
    } catch (error) {
      console.error('Error estimating gas:', error);
      alert('Error analyzing contract. Verify that the address is correct.');
    }
  };

  const addContract = (newContract: Contract) => {
    try {
      const updatedContracts = [...contracts, newContract];
      setContracts(updatedContracts);
      
      const contractsToSave: SavedContract[] = updatedContracts.map(contract => ({
        name: contract.name,
        averageGas: contract.averageGas,
        efficiency: contract.efficiency,
        gasUsage: contract.gasUsage,
        percentage: contract.percentage
      }));
      
      localStorage.setItem('savedContracts', JSON.stringify(contractsToSave));
    } catch (error) {
      console.error('Error saving contracts:', error);
    }
  };

  const deleteContract = (index: number) => {
    try {
      const updatedContracts = contracts.filter((_, i) => i !== index);
      setContracts(updatedContracts);
      
      const contractsToSave: SavedContract[] = updatedContracts.map(contract => ({
        name: contract.name,
        averageGas: contract.averageGas,
        efficiency: contract.efficiency,
        gasUsage: contract.gasUsage,
        percentage: contract.percentage
      }));
      
      localStorage.setItem('savedContracts', JSON.stringify(contractsToSave));
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Smart Contract Analysis
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center px-3 py-2 rounded-lg ${
            isDark 
              ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400' 
              : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
          }`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contract
        </button>
      </div>

      {/* Lista de contratos existente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contracts.map((contract, index) => (
          <div key={index} className={`${
            isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-100 border-slate-200'
          } p-4 rounded-lg border relative group`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Code2 className={`w-5 h-5 ${contract.color?.replace('bg-', 'text-')} mr-2`} />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {contract.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${contract.statusColor} text-sm font-medium`}>
                  {contract.status}
                </span>
                <button
                  onClick={() => deleteContract(index)}
                  className={`p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                    isDark 
                      ? 'hover:bg-red-500/20 text-red-400' 
                      : 'hover:bg-red-100 text-red-500'
                  }`}
                  title="Delete contract"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
              Average Gas: {contract.gasUsage.toLocaleString()}
            </p>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`${contract.color} h-2 rounded-full transition-all duration-300 ${getWidthClass(contract.percentage)}`}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para agregar contrato */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          } p-6 rounded-xl border shadow-xl w-full max-w-md`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Add New Contract
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Contract Name
                </label>
                <input
                  type="text"
                  value={newContract.name}
                  onChange={(e) => setNewContract(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white' 
                      : 'bg-white border-slate-300'
                  }`}
                  placeholder="My Contract"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Contract Address
                </label>
                <input
                  type="text"
                  value={newContract.address}
                  onChange={(e) => setNewContract(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full p-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white' 
                      : 'bg-white border-slate-300'
                  }`}
                  placeholder="0x..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDark 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddContract}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractAnalysis;