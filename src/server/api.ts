import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface EnhancedHistoricalData {
  firstRecord: {
    time: string;
    price: number;
  };
  lastRecord: {
    time: string;
    price: number;
  };
  networkStats: {
    currentLoad: number;        // El 8% que se muestra en la UI
    averageGasUsed: number;     // Promedio de gas usado
    pendingTransactions: number;// Transacciones pendientes
  };
  priceStats: {
    percentageChange: number;   // El 27.8% que se ve en la UI
    predictedLow: number;       // 14.01 Gwei en la imagen
    currentPrice: number;       // 16.48 Gwei actual
    dayHighLow: {
      high: number;
      low: number;
    };
  };
  timeContext: {
    dayOfWeek: number;         // Para patrones semanales
    hourOfDay: number;         // Para patrones diarios
    isWeekend: boolean;        // Comportamiento fin de semana
  }
}

export async function generateAIPredictions(
  historicalData: EnhancedHistoricalData, 
  chartImageBase64?: string,
  customPrompt?: string
) {
  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    
    if (chartImageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Analiza este gráfico de precios de gas de Ethereum de las últimas 24 horas y proporciona:\n\n" +
                 "1. Market Condition:\n" +
                 "- Tendencia general del gas\n" +
                 "- Niveles específicos de soporte y resistencia en Gwei\n" +
                 "- Porcentaje de variación en las últimas 24 horas\n\n" +
                 "2. Recomendaciones específicas basadas en el gráfico:\n" +
                 "- Identifica las horas exactas donde el gas estuvo más bajo en las últimas 24h\n" +
                 "- Compara el precio actual con los mínimos y máximos del día\n" +
                 "- Recomienda si ejecutar transacciones ahora o esperar a una hora específica\n" +
                 "- Menciona los rangos horarios donde históricamente el gas ha sido más económico\n\n" +
                 "3. Graph Analysis:\n" +
                 "- Patrones de volatilidad en horas específicas\n" +
                 "- Tendencias de congestión de la red en diferentes momentos del día\n" +
                 "- Proyección de precios para las próximas horas basada en el patrón actual"
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${chartImageBase64}`
            }
          }
        ]
      });
    }

    const prompt = `Analiza los datos de gas de Ethereum y el gráfico proporcionado:

1. PRECIOS Y TENDENCIAS:
- Precio actual: ${historicalData.priceStats.currentPrice.toFixed(2)} Gwei
- Variación: ${historicalData.priceStats.percentageChange.toFixed(2)}%
- Rango del día: ${historicalData.priceStats.dayHighLow.low.toFixed(2)} - ${historicalData.priceStats.dayHighLow.high.toFixed(2)} Gwei

2. PATRONES DEL GRÁFICO:
- Identifica tendencias visibles
- Analiza los puntos de soporte y resistencia
- Identifica los patrones de volatilidad

3. MÉTRICAS DE RED:
- Carga actual: ${historicalData.networkStats.currentLoad}%
- Promedio de gas: ${historicalData.networkStats.averageGasUsed.toFixed(2)} Gwei

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
{
  "predictedDrop": <número entre 5 y 30>,
  "optimalTime": "<HH:MM AM/PM> (estas horas deben ser las horas donde el gas estuvo mas bajo en las últimas 24h)>",
  "confidence": <número entre 1 y 10 basado en el analisis de los datos y el gráfico>,
  "recommendations": [<array de 3 strings con recomendaciones ingeniosas, estas recomendaciones deben tener todos los datos proporcinados>],
  "marketCondition": "<bullish|bearish|neutral>",
  "graphAnalysis": "<breve análisis del patrón visible en el gráfico explicando el comportamiento de la red y el razonamiento detras del resultado de marketCondition y dar un consejo sobre el trading de ETH>"
}`;

    messages.push({
      role: "user",
      content: prompt
    });

    const completion = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: messages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content || '';
    console.log('✅ OpenAI response:', response);

    if (customPrompt) {
      return {
        predictedDrop: 0,
        optimalTime: "Custom Query",
        recommendations: [response],
        marketCondition: "",
        graphAnalysis: ""
      };
    } else {
      try {
        function cleanJSONResponse(response: string): string {
          response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          return response.trim();
        }

        const cleanedResponse = cleanJSONResponse(response);
        const parsedResponse = JSON.parse(cleanedResponse);
        
        return {
          predictedDrop: parsedResponse.predictedDrop || 0,
          optimalTime: parsedResponse.optimalTime || "N/A",
          confidence: parsedResponse.confidence || 0,
          recommendations: parsedResponse.recommendations || [],
          marketCondition: parsedResponse.marketCondition || "neutral",
          graphAnalysis: parsedResponse.graphAnalysis || "No analysis available"
        };
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError);
        return {
          predictedDrop: 15,
          optimalTime: "Format Error",
          confidence: 5,
          recommendations: [
            "Could not process response in JSON format",
            response.slice(0, 100) + "..."
          ],
          marketCondition: "neutral",
          graphAnalysis: "Error analyzing market data"
        };
      }
    }
  } catch (error) {
    console.error('❌ Error in OpenAI:', error);
    throw error;
  }
} 