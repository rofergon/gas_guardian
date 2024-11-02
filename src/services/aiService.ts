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
    _previousAnalysis?: AIPrediction,
    chartImage?: string
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
      
      let enrichedPrompt = customPrompt;
      if (customPrompt) {
        enrichedPrompt = `Based on the current Ethereum network state and the provided chart visualization, please answer the following question:

${customPrompt}

Consider the following metrics in your analysis:
- Current Gas Price: ${lastRecord.price} Gwei
- Network Congestion: ${lastRecord.networkCongestion}
- Network Trend: ${lastRecord.networkTrend}
- Average Priority Fee: ${lastRecord.avgPriorityFee} Gwei

The chart visualization has been provided for additional context.
Please provide a detailed and specific answer focusing on the user's question.`;
      }
      
      const predictions = await generateAIPredictions(
        enhancedData, 
        chartImage,
        enrichedPrompt
      );
      
      return predictions;
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
