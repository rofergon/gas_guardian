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
    currentLoad: number;        
    averageGasUsed: number;    
    pendingTransactions: number;
  };
  priceStats: {
    percentageChange: number;   
    predictedLow: number;       
    currentPrice: number;       
    dayHighLow: {
      high: number;
      low: number;
    };
  };
  timeContext: {
    dayOfWeek: number;         
    hourOfDay: number;         
    isWeekend: boolean;        // Weekend behavior
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
            text: "Analyze this Ethereum gas price chart for the last 24 hours and provide:\n\n" +
                 "1. Market Condition:\n" +
                 "- General gas trend\n" +
                 "- Specific support and resistance levels in Gwei\n" +
                 "- Percentage variation in the last 24 hours\n\n" +
                 "2. Specific recommendations based on the chart:\n" +
                 "- Identify the exact hours where gas was lowest in the last 24h\n" +
                 "- Compare current price with day's highs and lows\n" +
                 "- Recommend whether to execute transactions now or wait for a specific time\n" +
                 "- Mention time ranges where gas has historically been cheaper\n\n" +
                 "3. Graph Analysis:\n" +
                 "- Volatility patterns at specific hours\n" +
                 "- Network congestion trends at different times of day\n" +
                 "- Price projection for the coming hours based on current pattern"
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

    if (customPrompt) {
      messages.push({
        role: "system",
        content: `Act as an expert Ethereum gas analyst. Use the following information as context:
        - Current price: ${historicalData.priceStats.currentPrice.toFixed(2)} Gwei
        - Variation: ${historicalData.priceStats.percentageChange.toFixed(2)}%
        - Day range: ${historicalData.priceStats.dayHighLow.low.toFixed(2)} - ${historicalData.priceStats.dayHighLow.high.toFixed(2)} Gwei
        - Network load: ${historicalData.networkStats.currentLoad}%`
      });
      
      messages.push({
        role: "user",
        content: customPrompt
      });
    } else {
      const prompt = `Analyze the Ethereum gas data and provided chart:

1. PRICES AND TRENDS:
- Current price: ${historicalData.priceStats.currentPrice.toFixed(2)} Gwei
- Variation: ${historicalData.priceStats.percentageChange.toFixed(2)}%
- Day range: ${historicalData.priceStats.dayHighLow.low.toFixed(2)} - ${historicalData.priceStats.dayHighLow.high.toFixed(2)} Gwei

2. CHART PATTERNS:
- Identify visible trends
- Analyze support and resistance points
- Identify volatility patterns

3. NETWORK METRICS:
- Current load: ${historicalData.networkStats.currentLoad}%
- Average gas: ${historicalData.networkStats.averageGasUsed.toFixed(2)} Gwei

IMPORTANT: Reply ONLY with a valid JSON object with this structure:
{
  "predictedDrop": <number between 5 and 30>,
  "optimalTime": "<HH:MM AM/PM> (these hours should be when gas was lowest in the last 24h)>",
  "confidence": <number between 1 and 10 based on data and chart analysis>,
  "recommendations": [<array of 3 strings with clever recommendations, these recommendations should include all provided data>],
  "marketCondition": "<bullish|bearish|neutral>",
  "graphAnalysis": "<brief analysis of the visible pattern in the chart explaining network behavior and reasoning behind marketCondition result and give advice about ETH trading>"
}`;

      messages.push({
        role: "user",
        content: prompt
      });
    }

    const completion = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: messages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content || '';

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