import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse, experimental_StreamData } from 'ai'
import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import { functions, chatWithMathAnimationRender, chatWithMathAnimationGenerator } from '@/lib/functions'
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
  const example6_openingManimExample = `# LaTeXAndGridTransformDemo. showcase of Manim's capabilities, including text and LaTeX rendering, transformations, and grid manipulation. \n from manim import *  
  class OpeningManim(Scene):     
     def construct(self):         
        title = Tex(r"This is some \\LaTeX")         
        basel = MathTex(r"\\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{\\pi^2}{6}")         
        VGroup(title, basel).arrange(DOWN)         
        self.play(             
           Write(title),             
           FadeInFrom(basel, UP),         
        )         
        self.wait()                    
        transform_title = Tex("That was a transform")         
        transform_title.to_corner(UP + LEFT)         
        self.play(             
           Transform(title, transform_title),             
           LaggedStart(*[FadeOutAndShift(obj, direction=DOWN) for obj in basel]),         
        )         
        self.wait()                    
        grid = NumberPlane()         
        grid_title = Tex("This is a grid")         
        grid_title.scale(1.5)         
        grid_title.move_to(transform_title)                    
        self.add(grid, grid_title) // Make sure title is on top of grid         
        self.play(             
           FadeOut(title),             
           FadeInFrom(grid_title, direction=DOWN),             
           Create(grid, run_time=3, lag_ratio=0.1),         
        )         
        self.wait()                    
        grid_transform_title = Tex(r"That was a non-linear function \\\\ applied to the grid")         
        grid_transform_title.move_to(grid_title, UL)         
        grid.prepare_for_nonlinear_transform()         
        self.play(             
           grid.animate.apply_function(                 
               lambda p: p                           
               + np.array(                     
                  [                         
                     np.sin(p[1]),                         
                     np.sin(p[0]),                         
                     0,                       
                  ]                 
               )             
           ),             
           run_time=3,         
        )         
        self.wait()         
        self.play(Transform(grid_title, grid_transform_title))         
        self.wait()`;
  
  const example7_sineCurveUnitCircleExample = `from manim import *  
  class SineCurveUnitCircle(Scene): 
     # contributed by heejin_park, https://infograph.tistory.com/230
     def construct(self):
        self.show_axis()
        self.show_circle()
        self.move_dot_and_draw_curve()
        self.wait()
     
     def show_axis(self):
        x_start = np.array([-6,0,0])
        x_end = np.array([6,0,0])  
        y_start = np.array([-4,-2,0])
        y_end = np.array([-4,2,0])
        x_axis = Line(x_start, x_end)
        y_axis = Line(y_start, y_end)
        self.add(x_axis, y_axis)
        self.add_x_labels()
        self.origin_point = np.array([-4,0,0])
        self.curve_start = np.array([-3,0,0])
     
     def add_x_labels(self):
        x_labels = [
           MathTex("\\pi"), MathTex("2 \\pi"),
           MathTex("3 \\pi"), MathTex("4 \\pi"),
        ]
        for i in range(len(x_labels)):
           x_labels[i].next_to(np.array([-1 + 2*i, 0, 0]), DOWN)
           self.add(x_labels[i])
     
     def show_circle(self):
        circle = Circle(radius=1)
        circle.move_to(self.origin_point) 
        self.add(circle)
        self.circle = circle
     
     def move_dot_and_draw_curve(self):
        orbit = self.circle
        origin_point = self.origin_point  
        dot = Dot(radius=0.08, color=YELLOW)
        dot.move_to(orbit.point_from_proportion(0))
        self.t_offset = 0
        rate = 0.25
  
        def go_around_circle(mob, dt):
           self.t_offset += (dt * rate)
           # print(self.t_offset)
           mob.move_to(orbit.point_from_proportion(self.t_offset % 1))
  
        def get_line_to_circle():
           return Line(origin_point, dot.get_center(), color=BLUE)
  
        def get_line_to_curve():
           x = self.curve_start[0] + self.t_offset * 4
           y = dot.get_center()[1]
           return Line(dot.get_center(), np.array([x,y,0]), color=YELLOW_A, stroke_width=2 )
  
        self.curve = VGroup()
        self.curve.add(Line(self.curve_start,self.curve_start))
        
        def get_curve():
           last_line = self.curve[-1]
           x = self.curve_start[0] + self.t_offset * 4  
           y = dot.get_center()[1]
           new_line = Line(last_line.get_end(),np.array([x,y,0]), color=YELLOW_D)
           self.curve.add(new_line)
           return self.curve
           
        dot.add_updater(go_around_circle)
        
        origin_to_circle_line = always_redraw(get_line_to_circle)
        dot_to_curve_line = always_redraw(get_line_to_curve)  
        sine_curve_line = always_redraw(get_curve)
     
        self.add(dot)
        self.add(orbit, origin_to_circle_line, dot_to_curve_line, sine_curve_line)
        self.wait(8.5)
  
        dot.remove_updater(go_around_circle)`;
        
  const example8_threeDCameraRotationExample = `from manim import *
  
  class ThreeDCameraRotation(ThreeDScene):
     def construct(self):
        axes = ThreeDAxes()
        circle=Circle()
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)
        self.add(circle,axes)
        self.begin_ambient_camera_rotation(rate=0.1) 
        self.wait()
        self.stop_ambient_camera_rotation()
        self.move_camera(phi=75 * DEGREES, theta=30 * DEGREES) 
        self.wait()`;

  const injectMsgs: CreateChatCompletionRequestMessage[] = [
    {
      role: 'system',
      content: `I have a few examples of Manim scripts that are designed to be educational and explain mathematical concepts through multiple animations. You must use these examples when function call. These examples are written for Manim version 0.6.0. Here are 1 Examples. Example 1: ${example1}.`
    },
    //\n Example 2: ${example4_graph} \n Example 3: ${example5_shapes}, \n Example 4: ${example6_openingManimExample}, \n Example 5: ${example7_sineCurveUnitCircleExample}, \n Example 6: ${example8_threeDCameraRotationExample}
    {
      role: 'system',
      content: 'Only use the functions you have been provided with. If you get an error running then try running it again following the function definitions and examples. When generating an animation you must first generate the code and then render the code.'
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
        case 'generate_math_animation_code':
          console.log("picking up math_animation genereation");
          console.log("args['concept']", args['concept'])
          result = await chatWithMathAnimationGenerator(args['concept'] as string);
          console.log("[generate_math_animation_code] result anim", result);
          data.append({
            function: 'concept'
          })
          break;
        
        case 'render_math_animation_code':
          console.log("picking up math_animation rendering");
          console.log("args['manim_code']", args['manim_code'])
          result = await chatWithMathAnimationRender(args['manim_code'] as string);
          console.log("[render_math_animation_code] result anim", result);
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
        model: 'gpt-3.5-turbo-16k',
        functions: functions,
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