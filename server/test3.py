from manim import *

class GradientIn3D(ThreeDScene):
    def construct(self):
        # Create 3D axes
        axes = ThreeDAxes()

        # Define the scalar field function
        def func(x, y, z):
            return x**2 + y**2 + z**2

        # Define the gradient of the scalar field
        def gradient(x, y, z):
            return np.array([2*x, 2*y, 2*z])

        # Create a collection of points in the 3D space
        points = [
            np.array([x, y, func(x, y, 0)]) 
            for x in np.linspace(-2, 2, 4) 
            for y in np.linspace(-2, 2, 4)
        ]

        # Create 3D arrows representing the gradient at each point
        gradient_arrows = VGroup(*[
            Arrow3D(
                start=point, 
                end=point + 0.5 * gradient(point[0], point[1], point[2]),
                color=YELLOW,
            )
            for point in points
        ])

        # Create LaTeX labels for the arrows
        labels = VGroup(*[
            MathTex(r"\nabla F").next_to(arrow.get_end(), RIGHT)
            for arrow in gradient_arrows
        ])

        # Animate the setup
        self.set_camera_orientation(phi=60 * DEGREES, theta=-45 * DEGREES)
        self.play(Create(axes), Create(gradient_arrows), Write(labels))
        self.wait(1)

        # Define a nonlinear transformation
        def nonlinear_transform(x, y, z):
            return np.array([x, y, z + 0.2*np.sin(5*x) + 0.2*np.sin(5*y)])

        # Apply the nonlinear transformation to the gradients
        self.play(
            gradient_arrows.animate.apply_function(nonlinear_transform),
            labels.animate.apply_function(nonlinear_transform),
            run_time=3
        )
        

        # Add LaTeX explanation for the transformation
        explanation = MathTex(
            r"\text{New position: }",
            r"\begin{pmatrix} x' \\ y' \\ z' \end{pmatrix}",
            r"=",
            r"\begin{pmatrix} x \\ y \\ z + 0.2\sin(5x) + 0.2\sin(5y) \end{pmatrix}"
        ).scale(0.7).to_corner(UR)

        self.play(Write(explanation))
        self.wait(2)
