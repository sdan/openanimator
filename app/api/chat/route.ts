import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse, experimental_StreamData } from 'ai'
import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import { functions, getWeather, chatWithPdfRetriever, chatWithVideoRetriever, chatWithWebRetriever, chatWithMathAnimation } from '@/lib/functions'
import { getSession } from 'next-auth/react'
import {examples} from '@/lib/examples';
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

  console.log("api chat router session in route.ts session now going to call openai", session);
  console.log("here are all prev messages", messages);

  const example1 = `from manim import *\nfrom math import *\nimport numpy as np\n\nclass RootScene(Scene):\n    def show_pendulum(self):\n        # Define the pendulum parameters\n        length = 3\n        gravity = 9.8\n\n        # Define the starting angle (40 degrees) and initial velocity\n        theta = np.radians(40)\n        speed = 0\n\n        # Create the pendulum's bob and rod\n        bob = Dot(point=length*RIGHT)\n        rod = Line(ORIGIN, bob.get_center())\n        pendulum = VGroup(rod, bob)\n\n        # Function to update the pendulum's position each frame\n        def update_pendulum(mob, dt):\n            nonlocal theta, speed\n            # Acceleration\n            acceleration = -gravity / length * np.sin(theta)\n            # Update speed\n            speed += acceleration * dt\n            # Update the angle (theta)\n            theta += speed * dt\n            # Update the positions of rod and bob\n            new_bob_position = length * np.sin(theta) * RIGHT + length * np.cos(theta) * DOWN\n            mob.become(VGroup(Line(ORIGIN, new_bob_position), Dot(point=new_bob_position)))\n\n        # Add the updater to the pendulum and animate\n        pendulum.add_updater(update_pendulum)\n        self.add(pendulum)\n        self.wait(10)  # Let the pendulum swing for 10 seconds\n\n    def construct(self):\n        # Create the pendulum animation\n        self.show_pendulum()`;
  const example2 = `Here are detailed instructions with verbatim examples for gpt-3.5-turbo-instruct on how to generate Manim code version 0.6.0 that can be compiled as a RootScene: First, import necessary modules: from manim import *  Define RootScene class inheriting from Scene: python class RootScene(Scene): Define construct method: python def construct(self): Create mobjects and add to scene: python circle = Circle() square = Square() self.add(circle, square)  Animate mobjects: python self.play(GrowFromCenter(circle)) self.play(Transform(square, circle))  Set camera orientation for 3D: python self.set_camera_orientation(phi=PI/2) Set up axes for graph scene: python self.setup_axes()  Get graph in graph scene: python sin_graph = self.get_graph(np.sin)  Add updater to mobject: python square.add_updater(lambda m: m.rotate(0.1)) Pause before scene end: python self.wait() So the full code would be: python from manim import * class RootScene(Scene): def construct(self): circle = Circle() square = Square() self.add(circle, square) self.play(GrowFromCenter(circle)) self.play(Transform(square, circle)) self.set_camera_orientation(phi=PI/2) self.setup_axes() sin_graph = self.get_graph(np.sin) square.add_updater(lambda m: m.rotate(0.1)) self.wait() This follows the examples verbatim and can be compiled as a RootScene in Manim 0.6.0. Let me know if you need any clarification or have additional examples!`;
  const example3_3d = "from manim import *\nimport numpy as np\nclass SurfacePlot(ThreeDScene):\n    def construct(self):\n        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)\n        def surface(u, v):\n            return np.array([u, v, np.sin(u) * np.cos(v)])\n        surf = ParametricSurface(surface, u_min=-PI, u_max=PI, v_min=-PI, v_max=PI)\n        axes = ThreeDAxes()\n        self.add(axes, surf)\n        self.play(Create(surf))\n        self.wait(1)";
  const example4_graph = "from manim import *\nimport numpy as np\nclass GraphFunctions(GraphScene):\n    def construct(self):\n        self.setup_axes()\n        graph1 = self.get_graph(lambda x: np.sin(x), color=BLUE)\n        graph2 = self.get_graph(lambda x: np.cos(x), color=GREEN)\n        label1 = self.get_graph_label(graph1, label='\\sin(x)')\n        label2 = self.get_graph_label(graph2, label='\\cos(x)')\n        self.play(Create(graph1), Write(label1))\n        self.wait(1)\n        self.play(Transform(graph1, graph2), Transform(label1, label2))\n        self.wait(1)";
  const example5_shapes = "from manim import *\nclass SimpleShapes(Scene):\n    def construct(self):\n        circle = Circle()\n        square = Square()\n        triangle = Triangle()\n        text = Text('Simple Shapes')\n        self.play(Create(circle))\n        self.play(Transform(circle, square))\n        self.play(Transform(circle, triangle))\n        self.play(Write(text))\n        self.wait(1)";


  const injectMsgs: CreateChatCompletionRequestMessage[] = [
    {
      role: 'system',
      content: `I have a few examples of Manim scripts that are designed to be educational and explain mathematical concepts through multiple animations. You must use these examples with math_animation function call. These examples are written for Manim version 0.6.0. Here are 3 Examples. Example 1: ${example3_3d} \n Example 2: ${example4_graph} \n Example 3: ${example5_shapes}`,
    },
    {
      role: 'system',
      content: 'Only use the functions you have been provided with. If you get an error running math_animation then try running it again following the function definitions and examples.'
    }
  ]
  
  console.log("OAI RESP functions", functions);
  let completeMsgs = [...injectMsgs, ...messages];
  console.log("OAI RESP messages",completeMsgs);
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k',
    // model: 'gpt-3.5-turbo-instruct',
    messages: completeMsgs,
    temperature: 0.7,
    stream: true,
    functions: functions,
  });

  console.log("responsed from openai");

  const data = new experimental_StreamData()
  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages
    ) => {
      let result;
      console.log("route name switch", name);
      switch (name) {
        case 'get_weather':
          result = await getWeather(args['city'] as string);
          break;
        case 'pdf_retrieval':
          result = await chatWithPdfRetriever(args['query'] as string, args['pdf_url'] as string);
          data.append({
            function: 'pdf_retrieval'
          })
          break;
        case 'video_retrieval':
          console.log("picking up video_retrieval");
          result = await chatWithVideoRetriever(args['query'] as string, args['video_id'] as string);
          data.append({
            function: 'video_retrieval'
          })
          break;
        case 'web_retrieval':
          console.log("picking up web_retrieval");
          result = await chatWithWebRetriever(args['query'] as string, args['url'] as string);
          data.append({
            function: 'web_retrieval'
          })
          break;
        case 'math_animation':
          console.log("picking up math_animation");
          console.log("args['manim_code']", args['manim_code'])
          result = await chatWithMathAnimation(args['manim_code'] as string);
          console.log("result anim", result);
          data.append({
            function: 'math_animation'
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