export const examples = {
    'example-1': 'from manim import * class SineCurveUnitCircle(Scene): # contributed by heejin_park, https://infograph.tistory.com/230 def construct(self): self.show_axis() self.show_circle() self.move_dot_and_draw_curve() self.wait() def show_axis(self): x_start = np.array([-6,0,0]) x_end = np.array([6,0,0]) y_start = np.array([-4,-2,0]) y_end = np.array([-4,2,0]) x_axis = Line(x_start, x_end) y_axis = Line(y_start, y_end) self.add(x_axis, y_axis) self.add_x_labels() self.origin_point = np.array([-4,0,0]) self.curve_start = np.array([-3,0,0]) def add_x_labels(self): x_labels = [ MathTex("\\pi"), MathTex("2 \\pi"), MathTex("3 \\pi"), MathTex("4 \\pi"), ] for i in range(len(x_labels)): x_labels[i].next_to(np.array([-1 + 2*i, 0, 0]), DOWN) self.add(x_labels[i]) def show_circle(self): circle = Circle(radius=1) circle.move_to(self.origin_point) self.add(circle) self.circle = circle def move_dot_and_draw_curve(self): orbit = self.circle origin_point = self.origin_point dot = Dot(radius=0.08, color=YELLOW) dot.move_to(orbit.point_from_proportion(0)) self.t_offset = 0 rate = 0.25 def go_around_circle(mob, dt): self.t_offset += (dt * rate) # print(self.t_offset) mob.move_to(orbit.point_from_proportion(self.t_offset % 1)) def get_line_to_circle(): return Line(origin_point, dot.get_center(), color=BLUE) def get_line_to_curve(): x = self.curve_start[0] + self.t_offset * 4 y = dot.get_center()[1] return Line(dot.get_center(), np.array([x,y,0]), color=YELLOW_A, stroke_width=2 ) self.curve = VGroup() self.curve.add(Line(self.curve_start,self.curve_start)) def get_curve(): last_line = self.curve[-1] x = self.curve_start[0] + self.t_offset * 4 y = dot.get_center()[1] new_line = Line(last_line.get_end(),np.array([x,y,0]), color=YELLOW_D) self.curve.add(new_line) return self.curve dot.add_updater(go_around_circle) origin_to_circle_line = always_redraw(get_line_to_circle) dot_to_curve_line = always_redraw(get_line_to_curve) sine_curve_line = always_redraw(get_curve) self.add(dot) self.add(orbit, origin_to_circle_line, dot_to_curve_line, sine_curve_line) self.wait(8.5) dot.remove_updater(go_around_circle)',
    'example-2': 'from manim import * class OpeningManim(Scene): def construct(self): title = Tex(r"This is some \\LaTeX") basel = MathTex(r"\\sum_{n=1}^\\infty rac{1}{n^2} = rac{\\pi^2}{6}") VGroup(title, basel).arrange(DOWN) self.play( Write(title), FadeInFrom(basel, UP), ) self.wait() transform_title = Tex("That was a transform") transform_title.to_corner(UP + LEFT) self.play( Transform(title, transform_title), LaggedStart(*[FadeOutAndShift(obj, direction=DOWN) for obj in basel]), ) self.wait() grid = NumberPlane() grid_title = Tex("This is a grid") grid_title.scale(1.5) grid_title.move_to(transform_title) self.add(grid, grid_title) # Make sure title is on top of grid self.play( FadeOut(title), FadeInFrom(grid_title, direction=DOWN), Create(grid, run_time=3, lag_ratio=0.1), ) self.wait() grid_transform_title = Tex( r"That was a non-linear function \\ applied to the grid" ) grid_transform_title.move_to(grid_title, UL) grid.prepare_for_nonlinear_transform() self.play( grid.animate.apply_function( lambda p: p + np.array( [ np.sin(p[1]), np.sin(p[0]), 0, ] ) ), run_time=3, ) self.wait() self.play(Transform(grid_title, grid_transform_title)) self.wait()',
    'example-3': 'from manim import * class MovingAngle(Scene): def construct(self): rotation_center = LEFT theta_tracker = ValueTracker(110) line1 = Line(LEFT, RIGHT) line_moving = Line(LEFT, RIGHT) line_ref = line_moving.copy() line_moving.rotate( theta_tracker.get_value() * DEGREES, about_point=rotation_center ) a = Angle(line1, line_moving, radius=0.5, other_angle=False) te = MathTex(r" heta").move_to( Angle( line1, line_moving, radius=0.5 + 3 * SMALL_BUFF, other_angle=False ).point_from_proportion(0.5) ) self.add(line1, line_moving, a, te) self.wait() line_moving.add_updater( lambda x: x.become(line_ref.copy()).rotate( theta_tracker.get_value() * DEGREES, about_point=rotation_center ) ) a.add_updater( lambda x: x.become(Angle(line1, line_moving, radius=0.5, other_angle=False)) ) te.add_updater( lambda x: x.move_to( Angle( line1, line_moving, radius=0.5 + 3 * SMALL_BUFF, other_angle=False ).point_from_proportion(0.5) ) ) self.play(theta_tracker.animate.set_value(40)) self.play(theta_tracker.animate.increment_value(140)) self.play(te.animate.set_color(RED), run_time=0.5) self.play(theta_tracker.animate.set_value(350))'
}