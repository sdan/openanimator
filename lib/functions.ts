import OpenAI from 'openai';
import {
  ChatCompletionMessage,
  ChatCompletionChunk,
  CreateChatCompletionRequestMessage,
  CompletionCreateParams
} from 'openai/resources/chat';

import { CompletionCreateParams } from 'openai/resources/chat'

export const functions: CompletionCreateParams.Function[] = [
  {
    name: 'get_weather',
    description: 'Get the current weather for a city.',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'The city to get the weather for.',
        }
      },
      required: ['city']
    }
  },
  {
    name: 'pdf_retrieval',
    description: 'Returns a text chunks most relevant to the user query from the provided PDF. You will use synthesize the text as if you are a researcher at Harvard in order to answer questions eloquently from the provided text chunks and sources. A plugin that allows users to load and query PDF documents or Google Drive documents using ChatGPT. Users must first provide a PDF URL for processing. Users can query, analyze, or ask questions from that PDF name without needing to specify everytime. User must provide a PDF or Google Drive link that can be publically accessible, only documents can be loaded. The query will be able to extract relevant parts of the document to the users request. The load may take a while to process and if it does not work on the first try, try again, unless you get an error message back. User can only load documents that can be publically accessible on the internet.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The query or question to ask based on the PDF document.',
        },
        pdf_url: {
          type: 'string',
          format: 'uri',
          description: 'The temporary URL of the PDF document that is already loaded.',
        }
      },
      required: ['query', 'pdf_url']
    }
  }
]

export async function callFunction(function_call: ChatCompletionMessage.FunctionCall): Promise<any> {
  const args = JSON.parse(function_call.arguments!);
  switch (function_call.name) {
    case 'get_weather':
      return await getWeather(args['city']);
    case 'pdf_retrieval':
      return await chatWithPdfRetriever(args['query'], args['pdf_url']);
    default:
      throw new Error('No function found');
  }
}

export async function chatWithPdfRetriever(query: string, pdf_url: string) {
  
  const loadUrl = "https://cardinal.tail8de85.ts.net/pdf/load";
  const queryUrl = "https://cardinal.tail8de85.ts.net/pdf/query";

  // First POST request to load the PDF
  const loadResponse = await fetch(loadUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "pdf_url": pdf_url,
    }),
  });

  if (!loadResponse.ok) {
    throw new Error(`Failed to load PDF. Status: ${loadResponse.status}`);
  }

  // Second POST request to query the loaded PDF
  const queryResponse = await fetch(queryUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "query": query,
      "pdf_url": pdf_url,
    }),
  });

  if (!queryResponse.ok) {
    throw new Error(`Failed to query PDF. Status: ${queryResponse.status}`);
  }

  // Get the response from the second call
  const response = await queryResponse.json();

  // Safely log the response
  console.log(response);

  // Return the response
  return response;
}

export async function getWeather(city: string) {
  try {
    const response = await fetch(`https://wttr.in/${city}?format=j1`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${city}`);
    }
    const jsonData = await response.json();
    const feelsLikeF = jsonData.current_condition[0].FeelsLikeF;
    const weatherDescription = jsonData.current_condition[0].weatherDesc[0].value;
    return `${city}: ${feelsLikeF}, ${weatherDescription}`;
  } catch (error) {
    throw new Error(`Failed to fetch weather data: ${error}`);
  }
}