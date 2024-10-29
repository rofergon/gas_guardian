import { ethers } from 'ethers';

export class ContractService {
  private provider: ethers.JsonRpcProvider;
  private contracts: SmartContract[] = [];

  constructor() {
    this.provider = new ethers.JsonRpcProvider(import.meta.env.VITE_QUICKNODE_HTTP_URL);
    
    // Contrato por defecto
    this.contracts.push({
      address: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
      name: 'Default Contract',
      averageGas: 150000,
      efficiency: 'Efficient'
    });
  }

  async getContractGasEstimate(address: string): Promise<number> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to: address,
        data: '0x70a08231' // Ejemplo de llamada a balanceOf
      });
      return gasEstimate.toNumber();
    } catch (error) {
      console.error('Error estimating gas:', error);
      return 0;
    }
  }

  addContract(contract: SmartContract): void {
    this.contracts.push(contract);
  }

  getContracts(): SmartContract[] {
    return this.contracts;
  }

  async getContractDetails(address: string) {
    try {
      // Obtener el código del contrato
      const code = await this.provider.getCode(address);
      
      // Verificar si es un contrato válido
      if (code === '0x') {
        throw new Error('No es un contrato válido');
      }

      // Obtener más detalles usando eth_call
      const response = await this.provider.send("eth_call", [{
        to: address,
        data: "0x70a08231000000000000000000000000" + address.slice(2) // ejemplo de llamada
      }, "latest"]);

      return {
        hasCode: code !== '0x',
        response
      };
    } catch (error) {
      console.error('Error getting contract details:', error);
      return null;
    }
  }
}
