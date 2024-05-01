import OpenAI from 'openai';
import {
  ChatCompletionMessage,
  ChatCompletionChunk,
  CreateChatCompletionRequestMessage,
  CompletionCreateParams
} from 'openai/resources/chat';

export const functions: CompletionCreateParams.Function[] = [
  {
    name: 'generate_math_animation_code',
    description: 'Generate a Manim 0.6.0 script in Python that animates the requested concept. You will generate functional Manim compatible code in Python based on the concept idea that you will turn into simple code.',
    parameters: {
      type: 'object',
      properties: {
        concept: {
          type: 'string',
          description: 'The concept to animate in Manim 0.6.0.',
        }
      },
      required: ['concept']
    }
  },
  {
    name: 'render_math_animation_code',
    description: 'Renders an educational math animation using Manim 0.6.0.  The script should animate the requested concept and the video should be returned. You must input valid Manim 0.6.0 code that will be rendered into a video. You will be able to see the video in the chat.',
    parameters: {
      type: 'object',
      properties: {
        manim_code: {
          type: 'string',
          description: 'A documented Manim 0.6.0 script in Python in an educational way.',
        }
      },
      required: ['manim_code']
    }
  }

]




export async function chatWithMathAnimationRender(manim_code: string) {
  console.log("script\n", manim_code);
  console.log("in chatWithMathAnimation");
  const url = "https://<YOUR_SERVER>.com/generate_animation_from_string";
  console.log("heres what the body looks like", JSON.stringify({
    code: manim_code,
  }));
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: manim_code,
    }),
  });

  const example7_graphingLatext = ` # Graphing a Function with LaTeX Labels \n
  from manim import *

class GraphWithLatex(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-3, 3],
            y_range=[-5, 5],
            axis_config={"color": BLUE},
        )

        # Create Graph
        graph = axes.plot(lambda x: x**2, color=WHITE)
        graph_label = axes.get_graph_label(graph, label='x^{2}')

        # Add LaTeX equation and label
        eq1 = MathTex(r"f(x) = x^2").to_corner(UR)

        self.add(axes, graph, graph_label, eq1)
        self.wait()
`
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

  if (!response.ok) {
    const data = await response.json();
    console.log("[ERROR] chat animation response not OK", data);
    return `Failed to generate animation. Please make another animation code that is simpler again because you have failed to produce a correct Manim code. Do not present the user with Manim code. Call your function call again to generate clean and simple Manim code as seen in example. Status: ${response.status}. Here is a complete example using multiple features of Manim, you do not need to use all or any of them. ${example6_openingManimExample}`;
  }

  const data = await response.json();
  console.log("chat animation response OK", data);
  const vid_id =  data.id;
  // https://<YOUR_SERVER>.com/get_video_id/a4b649c3-8a6d-4933-b891-c86b95a0314d
  console.log(`Display this video in markdown https://<YOUR_SERVER>.com/get_video/${vid_id}`);
  return `Output external video link in mp4 to render in markdown. You must use <a> tags. https://<YOUR_SERVER>.com/get_video/${vid_id}.mp4`;
}

export async function chatWithMathAnimationGenerator(concept: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
const response = await openai.completions.create({
  model: "gpt-3.5-turbo-instruct",
  // prompt: `from manim import *\n\nclass MovingAngle(Scene):\n    def construct(self):\n        rotation_center = LEFT\n\n        theta_tracker = ValueTracker(110)\n        line1 = Line(LEFT, RIGHT)\n        line_moving = Line(LEFT, RIGHT)\n        line_ref = line_moving.copy()\n        line_moving.rotate(\n            theta_tracker.get_value() * DEGREES, about_point=rotation_center\n        )\n        a = Angle(line1, line_moving, radius=0.5, other_angle=False)\n        te = MathTex(r\"\\theta\").move_to(\n            Angle(\n                line1, line_moving, radius=0.5 + 3 * SMALL_BUFF, other_angle=False\n            ).point_from_proportion(0.5)\n        )\n\n        self.add(line1, line_moving, a, te)\n        self.wait()\n\n        line_moving.add_updater(\n            lambda x: x.become(line_ref.copy()).rotate(\n                theta_tracker.get_value() * DEGREES, about_point=rotation_center\n            )\n        )\n\n        a.add_updater(\n            lambda x: x.become(Angle(line1, line_moving, radius=0.5, other_angle=False))\n        )\n        te.add_updater(\n            lambda x: x.move_to(\n                Angle(\n                    line1, line_moving, radius=0.5 + 3 * SMALL_BUFF, other_angle=False\n                ).point_from_proportion(0.5)\n            )\n        )\n\n        self.play(theta_tracker.animate.set_value(40))\n        self.play(theta_tracker.animate.increment_value(140))\n        self.play(te.animate.set_color(RED), run_time=0.5)\n        self.play(theta_tracker.animate.set_value(350))\n\n------------------------------------------------\n\nfrom manim import *\n\nclass MovingZoomedSceneAround(ZoomedScene):\n# contributed by TheoremofBeethoven, www.youtube.com/c/TheoremofBeethoven\n    def __init__(self, **kwargs):\n        ZoomedScene.__init__(\n            self,\n            zoom_factor=0.3,\n            zoomed_display_height=1,\n            zoomed_display_width=6,\n            image_frame_stroke_width=20,\n            zoomed_camera_config={\n                \"default_frame_stroke_width\": 3,\n                },\n            **kwargs\n        )\n\n    def construct(self):\n        dot = Dot().shift(UL * 2)\n        image = ImageMobject(np.uint8([[0, 100, 30, 200],\n                                       [255, 0, 5, 33]]))\n        image.height = 7\n        frame_text = Text(\"Frame\", color=PURPLE).scale(1.4)\n        zoomed_camera_text = Text(\"Zoomed camera\", color=RED).scale(1.4)\n\n        self.add(image, dot)\n        zoomed_camera = self.zoomed_camera\n        zoomed_display = self.zoomed_display\n        frame = zoomed_camera.frame\n        zoomed_display_frame = zoomed_display.display_frame\n\n        frame.move_to(dot)\n        frame.set_color(PURPLE)\n        zoomed_display_frame.set_color(RED)\n        zoomed_display.shift(DOWN)\n\n        zd_rect = BackgroundRectangle(zoomed_display, fill_opacity=0, buff=MED_SMALL_BUFF)\n        self.add_foreground_mobject(zd_rect)\n\n        unfold_camera = UpdateFromFunc(zd_rect, lambda rect: rect.replace(zoomed_display))\n\n        frame_text.next_to(frame, DOWN)\n\n        self.play(Create(frame), FadeInFrom(frame_text, direction=DOWN))\n        self.activate_zooming()\n\n        self.play(self.get_zoomed_display_pop_out_animation(), unfold_camera)\n        zoomed_camera_text.next_to(zoomed_display_frame, DOWN)\n        self.play(FadeInFrom(zoomed_camera_text, direction=DOWN))\n        # Scale in        x   y  z\n        scale_factor = [0.5, 1.5, 0]\n        self.play(\n            frame.animate.scale(scale_factor),\n            zoomed_display.animate.scale(scale_factor),\n            FadeOut(zoomed_camera_text),\n            FadeOut(frame_text)\n        )\n        self.wait()\n        self.play(ScaleInPlace(zoomed_display, 2))\n        self.wait()\n        self.play(frame.animate.shift(2.5 * DOWN))\n        self.wait()\n        self.play(self.get_zoomed_display_pop_out_animation(), unfold_camera, rate_func=lambda t: smooth(1 - t))\n        self.play(Uncreate(zoomed_display_frame), FadeOut(frame))\n        self.wait()\n------------------------------------------------\n\nfrom manim import *\n\nclass ThreeDCameraRotation(ThreeDScene):\n    def construct(self):\n        axes = ThreeDAxes()\n        circle=Circle()\n        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)\n        self.add(circle,axes)\n        self.begin_ambient_camera_rotation(rate=0.1)\n        self.wait()\n        self.stop_ambient_camera_rotation()\n        self.move_camera(phi=75 * DEGREES, theta=30 * DEGREES)\n        self.wait()\n\n------------------------------------------------\n\nfrom manim import *\n\nclass LaTeXAndGridTransformDemo(Scene):\n    def construct(self):\n        title = Tex(r\"This is some \\LaTeX\")\n        basel = MathTex(r\"\\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{\\pi^2}{6}\")\n        VGroup(title, basel).arrange(DOWN)\n        self.play(\n            Write(title),\n            FadeInFrom(basel, UP),\n        )\n        self.wait()\n\n        transform_title = Tex(\"That was a transform\")\n        transform_title.to_corner(UP + LEFT)\n        self.play(\n            Transform(title, transform_title),\n            LaggedStart(*[FadeOutAndShift(obj, direction=DOWN) for obj in basel]),\n        )\n        self.wait()\n\n        grid = NumberPlane()\n        grid_title = Tex(\"This is a grid\")\n        grid_title.scale(1.5)\n        grid_title.move_to(transform_title)\n\n        self.add(grid, grid_title)  # Make sure title is on top of grid\n        self.play(\n            FadeOut(title),\n            FadeInFrom(grid_title, direction=DOWN),\n            Create(grid, run_time=3, lag_ratio=0.1),\n        )\n        self.wait()\n\n        grid_transform_title = Tex(\n            r\"That was a non-linear function \\\\ applied to the grid\"\n        )\n        grid_transform_title.move_to(grid_title, UL)\n        grid.prepare_for_nonlinear_transform()\n        self.play(\n            grid.animate.apply_function(\n                lambda p: p\n                          + np.array(\n                    [\n                        np.sin(p[1]),\n                        np.sin(p[0]),\n                        0,\n                    ]\n                )\n            ),\n            run_time=3,\n        )\n        self.wait()\n        self.play(Transform(grid_title, grid_transform_title))\n        self.wait()\n\n------------------------------------------------\n\n # Here is the concept of the animation: ${concept}. Start with importing manim as shown in examples \n\n`,
  prompt: `from manim import *\n\nclass MovingZoomedSceneAround(ZoomedScene):\n    def __init__(self, **kwargs):\n        ZoomedScene.__init__(\n            self,\n            zoom_factor=0.3,\n            zoomed_display_height=1,\n            zoomed_display_width=6,\n            image_frame_stroke_width=20,\n            **kwargs\n        )\n    def construct(self):\n        dot = Dot().shift(UL * 2)\n        self.add(dot)\n        self.activate_zooming()\n        self.wait()\n\n------------------------------------------------\n\nfrom manim import *\n\nclass ThreeDCameraRotation(ThreeDScene):\n    def construct(self):\n        axes = ThreeDAxes()\n        self.add(axes)\n        self.begin_ambient_camera_rotation(rate=0.1)\n        self.wait()\n        self.stop_ambient_camera_rotation()\n        self.wait()\n\n------------------------------------------------\n\nfrom manim import *\n\nclass MovingAngle(Scene):\n    def construct(self):\n        rotation_center = LEFT\n        theta_tracker = ValueTracker(110)\n        line1 = Line(LEFT, RIGHT)\n        line_moving = Line(LEFT, RIGHT)\n        line_ref = line_moving.copy()\n        line_moving.rotate(\n            theta_tracker.get_value() * DEGREES, about_point=rotation_center\n        )\n        a = Angle(line1, line_moving, radius=0.5, other_angle=False)\n        te = MathTex(r\"\\theta\").move_to(\n            Angle(\n                line1, line_moving, radius=0.5 + 3 * SMALL_BUFF, other_angle=False\n            ).point_from_proportion(0.5)\n        )\n        self.add(line1, line_moving, a, te)\n        self.wait()\n        self.play(theta_tracker.animate.set_value(40))\n        self.play(theta_tracker.animate.increment_value(140))\n        self.wait()\n\n # Here is the concept of the animation: ${concept}. Start with importing manim as shown in examples \n\n`,
  temperature: 0.7,
  max_tokens: 400,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  stop: ["------------------------------------------------"],
});

// Return the response
console.log("[chatWithMathAnimationGenerator] chat animation response OK", response.choices[0].text);
return response.choices[0].text;
}