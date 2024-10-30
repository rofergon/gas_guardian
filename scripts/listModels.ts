import OpenAI from "openai";
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

async function main() {
  try {
    const list = await openai.models.list();
    console.log('Modelos disponibles:');
    console.log('-------------------');
    
    for (const model of list.data) {
      console.log(`- ${model.id}`);
    }
  } catch (error) {
    console.error('Error al obtener los modelos:', error);
  }
}

main();