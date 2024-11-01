export const calculateTrend = (currentValue: number, previousValue?: number): number => {
  if (!previousValue) return 0;
  
  const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
  return Number(percentageChange.toFixed(2));
}; 