import { generateAIPredictions } from '../server/api';

interface AIPrediction {
  predictedDrop: number;
  optimalTime: string;
  recommendations: string[];
}

export const aiService = {
  async generatePredictions(historicalData: { time: string; price: number }[]): Promise<AIPrediction> {
    try {
      const simplifiedData = {
        firstRecord: historicalData[0],
        lastRecord: historicalData[historicalData.length - 1]
      };
      
      const predictions = await generateAIPredictions(simplifiedData);
      
      return {
        predictedDrop: predictions.predictedDrop,
        optimalTime: predictions.optimalTime,
        recommendations: predictions.recommendations
      };
    } catch (error) {
      console.error('Error generando predicciones:', error);
      // Valores por defecto en caso de error
      return {
        predictedDrop: 15,
        optimalTime: "2:00 AM",
        recommendations: [
          "Retrasar transacciones no urgentes",
          "Agrupar múltiples transacciones",
          "Considerar soluciones Layer 2"
        ]
      };
    }
  }
};
