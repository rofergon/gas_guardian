export interface SmartContract {
  address: string;
  name: string;
  averageGas: number;
  efficiency: 'Efficient' | 'Moderate' | 'High';
}
