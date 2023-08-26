import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  console.log("await auth()",await auth())
  const userId = (await auth())?.user.sub

  if (!userId) {
    return new Response('NO USERID Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    configuration.apiKey = previewToken
  }

  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true
  })

    // const stream = OpenAIStream(res, {
  //   experimental_onFunctionCall: async (
  //     { name, arguments: args }: any,
  //     createFunctionCallMessages: (arg0: { temperature: number; unit: string }) => any
  //   ) => {
  //     // if you skip the function call and return nothing, the `function_call`
  //     // message will be sent to the client for it to handle
  //     if (name === 'get_current_weather') {
  //       // Call a weather API here
  //       const weatherData = {
  //         temperature: 20,
  //         unit: args.format === 'celsius' ? 'C' : 'F'
  //       }
   
  //       // `createFunctionCallMessages` constructs the relevant "assistant" and "function" messages for you
  //       const newMessages = createFunctionCallMessages(weatherData)
  //       return openai.chat.completions.create({
  //         messages: [...messages, ...newMessages],
  //         stream: true,
  //         model: 'gpt-3.5-turbo-0613',
  //         // see "Recursive Function Calls" below
  //         functions
  //       })
  //     }
  //   }
  // })

  const stream = OpenAIStream(res, {
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
    }
  })


  return new StreamingTextResponse(stream)
}
