import { generateAIPredictions } from '../server/api';

interface AIPrediction {
  predictedDrop: number;
  optimalTime: string;
  recommendations: string[];
}

export const aiService = {
  async generatePredictions(historicalData: { time: string; price: number }[]): Promise<AIPrediction> {
    try {
      const predictions = await generateAIPredictions(historicalData);
      
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
