from flask import Flask, request, send_file, jsonify
import os
import subprocess
import logging
import uuid

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

mp4_files = {}

@app.route('/')
def hello_world():
    return 'Hello, World!'

def validate_file(file):
    if file is None or file.filename == '':
        return False, jsonify({"error": "No file provided"}), 400
    return True, None, None

@app.route('/generate_animation', methods=['POST'])
def generate_animation():
    logging.info("Generating animation")

    uploaded_file = request.files.get('code')
    is_valid, error_response, status_code = validate_file(uploaded_file)
    
    if not is_valid:
        return error_response, status_code

    code = uploaded_file.read().decode('utf-8')
    logging.info(f"Received code: {code[:50]}...")

    screen_name = str(uuid.uuid4())

    with open(f"/app/{screen_name}.py", "w") as f:
        f.write(code)

    try:
        output_path = f"/app/media/{screen_name}.mp4"
        result = subprocess.run(
            ["manim", "-ql", "-o", output_path, f"/app/{screen_name}.py"],
            check=False,  # Don't raise an exception if the command fails
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        if result.returncode != 0:
            logging.error(f"Manim error: {result.stderr.decode('utf-8')}")
            return jsonify({"error": f"Manim error: {result.stderr.decode('utf-8')}"}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

    if not os.path.exists(output_path):
        logging.error("MP4 file not generated")
        return jsonify({"error": "MP4 file not generated"}), 500
    
    return jsonify({"success": "MP4 file generated file upload", "id": screen_name})


@app.route('/generate_animation_from_string', methods=['POST'])
def generate_animation_from_string():
    data = request.json

    if not data or 'code' not in data:
        return jsonify({"error": "No code provided"}), 400

    code = data['code']
    logging.info(f"Received code: {code[:50]}...")

    screen_name = str(uuid.uuid4())
    output_path = f"/app/media/{screen_name}.mp4"

    with open(f"/app/{screen_name}.py", "w") as f:
        f.write(code)

    try:
        subprocess.run(["manim", "-ql", "-o", output_path, f"/app/{screen_name}.py"], check=True)
    except subprocess.CalledProcessError as e:
        logging.error(f"Manim error: {e}")
        return jsonify({"error": f"Manim error: {str(e)}"}), 500

    if not os.path.exists(output_path):
        logging.error("MP4 file not generated")
        return jsonify({"error": "MP4 file not generated"}), 500

    return jsonify({"success": "MP4 file generated", "id": screen_name})

@app.route('/get_video/<video_id>.<ext>', methods=['GET'])
@app.route('/get_video/<video_id>', methods=['GET'], defaults={'ext': None})
def get_video(video_id, ext):
    output_path = f"/app/media/{video_id}.mp4"
    
    # Validate the extension if it's provided
    if ext and ext != 'mp4':
        return jsonify({"error": "Invalid extension"}), 400

    if os.path.exists(output_path):
        return send_file(output_path, as_attachment=False, mimetype='video/mp4')
    else:
        return jsonify({"error": "Video not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', use_reloader=False)
