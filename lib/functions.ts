import OpenAI from 'openai';
import {
    ChatCompletionMessage,
    ChatCompletionChunk,
    CreateChatCompletionRequestMessage,
  } from 'openai/resources/chat';

export const functions: OpenAI.Chat.CompletionCreateParams.Function[] = [
    {
      name: 'list',
      description: 'list queries books by genre, and returns a list of names of books',
      parameters: {
        type: 'object',
        properties: {
          genre: { type: 'string', enum: ['mystery', 'nonfiction', 'memoir', 'romance', 'historical'] },
        },
      },
    },
    {
      name: 'search',
      description: 'search queries books by their name and returns a list of book names and their ids',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
    },
    {
      name: 'get',
      description:
        "get returns a book's detailed information based on the id of the book. Note that this does not accept names, and only IDs, which you can get by using search.",
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  ];

  export async function callFunction(function_call: ChatCompletionMessage.FunctionCall): Promise<any> {
    const args = JSON.parse(function_call.arguments!);
    switch (function_call.name) {
      case 'list':
        return await list(args['genre']);
  
      case 'search':
        return await search(args['name']);
  
      case 'get':
        return await get(args['id']);
  
      default:
        throw new Error('No function found');
    }
  }