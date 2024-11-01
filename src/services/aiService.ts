import { generateAIPredictions } from '../server/apiOpenai';
import type { BlockChartData } from '../hooks/useBlockDataChart';

interface AIPrediction {
  predictedDrop: number;
  optimalTime: string;
  recommendations: string[];
  marketCondition: string;
  graphAnalysis: string;
  confidence: number;
}

export const aiService = {
  async generatePredictions(
    gasData: BlockChartData[], 
    customPrompt?: string,
    previousAnalysis?: AIPrediction
  ): Promise<AIPrediction> {
    try {
      const lastRecord = gasData[gasData.length - 1];
      
      const enhancedData = {
        currentData: {
          price: lastRecord.price,
          networkActivity: lastRecord.networkActivity,
          gasUsed: lastRecord.gasUsed,
          utilizationPercent: lastRecord.utilizationPercent,
          totalTransactions: lastRecord.totalTransactions,
          networkCongestion: lastRecord.networkCongestion,
          networkTrend: lastRecord.networkTrend,
          avgGasPrice: lastRecord.avgGasPrice,
          medianGasPrice: lastRecord.medianGasPrice,
          avgPriorityFee: lastRecord.avgPriorityFee,
          medianPriorityFee: lastRecord.medianPriorityFee
        },
        stats: {
          percentageChange: calculatePercentageChange(gasData),
          dayHighLow: {
            high: Math.max(...gasData.map(d => d.price)),
            low: Math.min(...gasData.map(d => d.price))
          }
        }
      };
      
      let enrichedPrompt = '';
      if (customPrompt) {
        const lastHourData = gasData.slice(-4); // last 4 entries (1 hour)
        const avgUtilization = lastHourData.reduce((acc, curr) => acc + curr.utilizationPercent, 0) / lastHourData.length;
        
        enrichedPrompt = `Current Ethereum Network Context:
        - Current Price: ${lastRecord.price} Gwei
        - Average Utilization Last Hour: ${avgUtilization.toFixed(2)}%
        - Network Trend: ${lastRecord.networkTrend}
        - Congestion: ${lastRecord.networkCongestion}
        - Priority Fee: ${lastRecord.avgPriorityFee} Gwei
        
        Previous Analysis:
        - Market Condition: ${previousAnalysis?.marketCondition || 'N/A'}
        - Previous Confidence: ${previousAnalysis?.confidence || 'N/A'}/10
        
        User Question: ${customPrompt}
        
        Please provide specific analysis considering:
        1. Current network data
        2. Last hour trend
        3. Practical and specific recommendations
        4. Optimal timing if relevant`;
      }
      
      const predictions = await generateAIPredictions(enhancedData, undefined, enrichedPrompt);
      
      return {
        predictedDrop: predictions.predictedDrop,
        optimalTime: predictions.optimalTime,
        recommendations: predictions.recommendations,
        marketCondition: predictions.marketCondition,
        graphAnalysis: predictions.graphAnalysis,
        confidence: predictions.confidence || 0
      };
    } catch (error) {
      console.error('Error generating predictions:', error);
      return {
        predictedDrop: 15,
        optimalTime: "2:00 AM",
        recommendations: [
          "Delay non-urgent transactions",
          "Bundle multiple transactions",
          "Consider Layer 2 solutions"
        ],
        marketCondition: "neutral",
        graphAnalysis: "No analysis available",
        confidence: 0
      };
    }
  }
};

function calculatePercentageChange(data: BlockChartData[]): number {
  if (data.length < 2) return 0;
  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  return ((lastPrice - firstPrice) / firstPrice) * 100;
}
