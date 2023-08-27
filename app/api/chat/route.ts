import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse, experimental_StreamData } from 'ai'
import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import { functions, getWeather, chatWithPdfRetriever, chatWithVideoRetriever, chatWithWebRetriever } from '@/lib/functions'
import { getSession } from 'next-auth/react'

import OpenAI from 'openai';
import {
  ChatCompletionMessage,
  ChatCompletionChunk,
  CreateChatCompletionRequestMessage,
} from 'openai/resources/chat';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const json = await req.json();
  console.log("JSON IN POST",json)
  const { messages, previewToken, session} = json;
  const authResp = await auth();
  console.log("authResp",authResp)
  const userId = (authResp)?.user.sub;

  if (!userId) {
    return new Response('NO USERID Unauthorized', {
      status: 401,
    });
  }
  console.log("previewTokenpreviewToken", previewToken);
  
  if (previewToken) {
    openai.apiKey = previewToken;
  }

  console.log("api chat routerouterouterouteroute session", session);

  const injectMsgs: CreateChatCompletionRequestMessage[] = [
    {
      role: 'system',
      content: 'You have the following functions available: get_weather(city) and chat_with_pdf(query, pdf_url).'
    }
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k',
    messages: messages,
    temperature: 0.7,
    stream: true,
    functions: functions,
  });

  const data = new experimental_StreamData()
  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages
    ) => {
      let result;
      console.log("route name swithc", name);
      switch (name) {
        case 'get_weather':
          result = await getWeather(args['city']);
          break;
        case 'pdf_retrieval':
          result = await chatWithPdfRetriever(args['query'], args['pdf_url']);
          data.append({
            function: 'pdf_retrieval'
          })
          break;
        case 'video_retrieval':
          console.log("picking up video_retrieval");
          result = await chatWithVideoRetriever(args['query'], args['video_id']);
          data.append({
            function: 'video_retrieval'
          })
          break;
        case 'web_retrieval':
          console.log("picking up web_retrieval");
          result = await chatWithWebRetriever(args['query'], args['url']);
          data.append({
            function: 'web_retrieval'
          })
          break;
        default:
          throw new Error('No function found');
      }
  
      const newMessages = createFunctionCallMessages(result);
      return openai.chat.completions.create({
        messages: [...messages, ...newMessages],
        stream: true,
        model: 'gpt-3.5-turbo-16k'
      });
    },
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })
    },
    onFinal(completion) {
      data.close()
    },
    experimental_streamData: true
  })

  return new StreamingTextResponse(stream, {}, data)
}