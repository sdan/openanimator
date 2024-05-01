# Use the Manim community image as the base
FROM manimcommunity/manim:v0.6.0

# Install Flask and other dependencies
RUN pip install Flask

# Set the working directory
WORKDIR /app

# Copy your Flask app to the container
COPY . /app

# Switch to root user
USER 0

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["python", "main.py"]
