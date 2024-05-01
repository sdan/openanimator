from flask import Flask, request, send_file
import os
import subprocess
import logging
import uuid

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

@app.route('/generate_animation', methods=['POST'])
def generate_animation():
    logging.info("Generating animation")

    ## list all files in the current directory
    for file in os.listdir("."):
       print(file)

    print("List Directories:")
    ## lsit all folders in the current directory
    for folder in os.listdir("."):
         if os.path.isdir(folder):
             print(folder)

    uploaded_file = request.files.get('code')
    
    if uploaded_file is None or uploaded_file.filename == '':
        return {"error": "No file provided"}, 400

    code = uploaded_file.read().decode('utf-8')
    logging.info(f"Received code: {code[:50]}...")

    with open("/app/script.py", "w") as f:
        f.write(code)

    screen_name = str(uuid.uuid4())
    
    try:
        output_path = f"/app/media/{screen_name}.mp4"
        subprocess.run(["manim", "-ql", "-o", output_path, "/app/script.py"], check=True)
    except subprocess.CalledProcessError as e:
        logging.error(f"Manim error: {e}")
        return {"error": f"Manim error: {str(e)}"}, 500

    mp4_file = f"/app/media/{screen_name}.mp4"
    if not os.path.exists(mp4_file):
        logging.error("MP4 file not generated")
        return {"error": "MP4 file not generated"}, 500

    return send_file(mp4_file, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, use_reloader=False)
