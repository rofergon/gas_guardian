export interface GasData {
  time: string;
  price: number;
}

export interface ContractData {
  name: string;
  status: 'Efficient' | 'Moderate' | 'High Usage';
  gasUsage: number;
  color: 'blue' | 'purple' | 'red';
  percentage: number;
}

export interface AlertSetting {
  id: string;
  name: string;
  enabled: boolean;
}