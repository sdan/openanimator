from manim import *

class Integral(Scene):
    def construct(self):
        self.show_axes()
        self.show_function()
        self.show_area_under_curve()
        self.wait()

    def show_axes(self):
        x_start = np.array([-5,0,0])
        x_end = np.array([5,0,0])

        y_start = np.array([-3,-2,0])
        y_end = np.array([-3,2,0])

        x_axis = Line(x_start, x_end)
        y_axis = Line(y_start, y_end)

        self.add(x_axis, y_axis)
        self.add_x_labels()

        self.origin_point = np.array([-3,0,0])
        self.curve_start = np.array([-4,0,0])

    def add_x_labels(self):
        x_labels = [
            MathTex("\pi"), MathTex("2 \pi"),
            MathTex("3 \pi"), MathTex("4 \pi"),
        ]

        for i in range(len(x_labels)):
            x_labels[i].next_to(np.array([-1 + 2*i, 0, 0]), DOWN)
            self.add(x_labels[i])

    def show_function(self):
        graph = self.get_graph(lambda x: 3 * np.cos(x), x_min=-2 * PI, x_max=2 * PI, color=BLUE)
        self.add(graph)

    def show_area_under_curve(self):
        area = self.create_area(self.curve_start, self.curve_start)

        def get_area_under_curve():
            return self.create_area(self.curve_start, self.curve[-1].get_right())

        self.curve = VGroup()

        def get_curve():
            x = self.curve_start[0] + self.t_offset
            y = 3 * np.sin(x)
            new_line = Line(self.curve[-1].get_end(), np.array([x,y,0]), color=RED, stroke_width=2)
            self.curve.add(new_line)

            return self.curve

        self.t_offset = 0
        rate = 0.005

        def update_area(mob, dt):
            self.t_offset += (dt * rate)
            mob.become(get_area_under_curve())

        area.add_updater(update_area)

        self.add(area)
        self.add(AlwaysMovingDot(color=YELLOW).set_rate(0.005).move_to(self.curve_start))
        self.add(PartialLine(self.curve_start, self.curve_start, color=GREEN))