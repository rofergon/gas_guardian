import { useState } from 'react';
import { ContractService } from '../services/ContractService';
import { ethers } from 'ethers';

interface SmartContract {
  address: string;
  name: string;
  averageGas: number;
  efficiency: 'Efficient' | 'Moderate' | 'High';
}

const contractService = new ContractService();

export function ContractAnalysis() {
  const [contracts, setContracts] = useState(contractService.getContracts());
  const [newAddress, setNewAddress] = useState('');

  const handleAddContract = async () => {
    if (ethers.isAddress(newAddress)) {
      const gasEstimate = await contractService.getContractGasEstimate(newAddress);
      
      const newContract: SmartContract = {
        address: newAddress,
        name: `Custom Contract ${contracts.length + 1}`,
        averageGas: gasEstimate,
        efficiency: gasEstimate < 200000 ? 'Efficient' : 
                   gasEstimate < 300000 ? 'Moderate' : 'High'
      };

      contractService.addContract(newContract);
      setContracts(contractService.getContracts());
      setNewAddress('');
    }
  };

  return (
    <div>
      <h2>Smart Contract Analysis</h2>
      
      {/* Formulario para agregar contratos */}
      <div>
        <input 
          type="text"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          placeholder="Enter contract address"
        />
        <button onClick={handleAddContract}>Add Contract</button>
      </div>

      {/* Lista de contratos */}
      <div className="contracts-grid">
        {contracts.map((contract) => (
          <div key={contract.address} className="contract-card">
            <h3>{contract.name}</h3>
            <p>Address: {contract.address}</p>
            <p>Average Gas: {contract.averageGas}</p>
            <p>Efficiency: {contract.efficiency}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
