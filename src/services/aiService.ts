import { generateAIPredictions } from '../server/apiOpenai';

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
    gasData: { time: string; price: number }[], 
    customPrompt?: string,
    previousAnalysis?: AIPrediction
  ): Promise<AIPrediction> {
    try {
      const enhancedData = {
        firstRecord: gasData[0],
        lastRecord: gasData[gasData.length - 1],
        networkStats: {
          currentLoad: Math.min(100, Math.floor(gasData[gasData.length - 1].price / 2)),
          averageGasUsed: calculateAverageGas(gasData),
          pendingTransactions: 0
        },
        priceStats: {
          currentPrice: gasData[gasData.length - 1].price,
          percentageChange: calculatePercentageChange(gasData),
          predictedLow: Math.min(...gasData.map(d => d.price)) * 0.9,
          dayHighLow: {
            high: Math.max(...gasData.map(d => d.price)),
            low: Math.min(...gasData.map(d => d.price))
          }
        },
        timeContext: {
          hourOfDay: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          isWeekend: [0, 6].includes(new Date().getDay())
        }
      };
      
      let enrichedPrompt = customPrompt;
      if (customPrompt && previousAnalysis) {
        enrichedPrompt = `Current market context:
        - Market condition: ${previousAnalysis.marketCondition}
        - Previous analysis: ${previousAnalysis.graphAnalysis}
        - Confidence: ${previousAnalysis.confidence}/10
        
        User question: ${customPrompt}`;
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

function calculatePercentageChange(data: { price: number }[]): number {
  if (data.length < 2) return 0;
  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  return ((lastPrice - firstPrice) / firstPrice) * 100;
}

function calculateAverageGas(data: { price: number }[]): number {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, curr) => acc + curr.price, 0);
  return sum / data.length;
}
