import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateAIPredictions(historicalData: any, customPrompt?: string) {
  console.log('🚀 Starting AI prediction generation');
  console.log('📊 Historical data received:', historicalData);

  try {
    let prompt;
    const isCustomQuery = Boolean(customPrompt);

    if (isCustomQuery) {
      prompt = `Analyze this Ethereum gas data and answer: ${customPrompt}
                Data: ${JSON.stringify(historicalData)}`;
    } else {
      prompt = `Based on these Ethereum gas price data points:
        Initial reading at ${historicalData.firstRecord.time}: ${historicalData.firstRecord.price} Gwei
        Current reading at ${historicalData.lastRecord.time}: ${historicalData.lastRecord.price} Gwei
        
        Provide in JSON format:
        {
          "predictedDrop": number between 5 and 30,
          "optimalTime": time in "HH:MM AM/PM" format,
          "recommendations": [array of 3 recommendations]
        }`;
    }

    console.log('📝 Final prompt:', prompt);

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content || '';
    console.log('✅ OpenAI response:', response);

    if (isCustomQuery) {
      return {
        predictedDrop: 0,
        optimalTime: "Custom Query",
        recommendations: [response]
      };
    } else {
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError);
        return {
          predictedDrop: 15,
          optimalTime: "Format Error",
          recommendations: [
            "Could not process response in JSON format",
            response.slice(0, 100) + "..." // Include part of the response as recommendation
          ]
        };
      }
    }
  } catch (error) {
    console.error('❌ Error in OpenAI:', error);
    throw error;
  }
} 