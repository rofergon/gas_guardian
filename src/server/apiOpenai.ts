import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface EnhancedHistoricalData {
  currentData: {
    price: number;
    networkActivity: number;
    gasUsed: number;
    utilizationPercent: number;
    totalTransactions: number;
    networkCongestion: string;
    networkTrend: string;
    avgGasPrice: number;
    medianGasPrice: number;
    avgPriorityFee: number;
    medianPriorityFee: number;
  };
  stats: {
    percentageChange: number;
    dayHighLow: {
      high: number;
      low: number;
    };
  };
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
        - Current price: ${historicalData.currentData.price.toFixed(2)} Gwei
        - Network Congestion: ${historicalData.currentData.networkCongestion}
        - Network Trend: ${historicalData.currentData.networkTrend}
        - Network Activity: ${historicalData.currentData.networkActivity}%
        - Average Gas Price: ${historicalData.currentData.avgGasPrice} Gwei
        - Median Priority Fee: ${historicalData.currentData.medianPriorityFee} Gwei
        - Total Transactions: ${historicalData.currentData.totalTransactions}`
      });
      
      messages.push({
        role: "user",
        content: customPrompt
      });
    } else {
      const prompt = `Analyze the following Ethereum gas data and provide specific recommendations:

1. CURRENT DATA:
- Base Price: ${historicalData.currentData.price.toFixed(2)} Gwei
- 24h Trend: ${historicalData.stats.percentageChange}%
- Day Range: High ${historicalData.stats.dayHighLow.high} / Low ${historicalData.stats.dayHighLow.low} Gwei
- Current Utilization: ${historicalData.currentData.utilizationPercent}%

2. NETWORK METRICS:
- Total Transactions: ${historicalData.currentData.totalTransactions}
- Congestion: ${historicalData.currentData.networkCongestion}
- Average Priority Fee: ${historicalData.currentData.avgPriorityFee} Gwei

SPECIFIC INSTRUCTIONS:
1. Compare current price with day range to determine if it's a good time
2. Analyze utilization trend to predict congestion
3. Consider priority fee for urgency recommendations
4. Provide specific timing based on historical patterns

Respond ONLY with a JSON object using this structure:
{
  "predictedDrop": <number based on difference between current and minimum price>,
  "optimalTime": "<HH:MM AM/PM based on utilization patterns>",
  "confidence": <1-10 based on data consistency>,
  "recommendations": [
    "<specific timing recommendation>",
    "<priority fee recommendation>",
    "<transaction type recommendation>"
  ],
  "marketCondition": "<bullish if trend > 5% | bearish if < -5% | neutral>",
  "graphAnalysis": "<detailed analysis of current metrics and trends>"
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