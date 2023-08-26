import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const json = await req.json();
  const { messages, previewToken } = json;
  const userId = (await auth())?.user.sub;

  if (!userId) {
    return new Response('NO USERID Unauthorized', {
      status: 401,
    });
  }

  console.log('previewToken', previewToken)
  console.log('messages', messages)
  
  if (previewToken) {
    openai.apiKey = previewToken;
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true,
  });

  console.log('resc', res)

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100);
      const id = json.id ?? nanoid();
      const createdAt = Date.now();
      const path = `/chat/${id}`;
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion.choices[0]?.text,
            role: 'assistant',
          },
        ],
      };
      await kv.hmset(`chat:${id}`, payload);
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`,
      });
    },
  });

  return new StreamingTextResponse(stream);
}