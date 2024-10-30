import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

export const handler: Handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No se proporcionaron datos' })
      };
    }

    const { historicalData } = JSON.parse(event.body);

    const prompt = `
      Basado en estos datos históricos de precios de gas en Ethereum:
      ${JSON.stringify(historicalData)}
      
      Por favor analiza y proporciona:
      1. El porcentaje probable de caída en las próximas horas
      2. La hora óptima para transacciones
      3. Tres recomendaciones específicas para los usuarios
      
      Responde en formato JSON.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    return {
      statusCode: 200,
      body: completion.choices[0].message.content || ''
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
