from flask import Flask, send_from_directory, jsonify
import os
from config import config

# Create Flask application
app = Flask(__name__, static_folder='ui/build', static_url_path='')

# Load the configuration based on the environment
env = os.getenv('FLASK_ENV', 'default')  # Options: 'development', 'testing', 'production'
app.config.from_object(config[env])

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    # If the requested file exists in the React build directory, serve it
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # Otherwise, serve React's index.html
    return send_from_directory(app.static_folder, 'index.html')

# API endpoint example
@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({
        "message": "Hello from Flask!",
        "environment": env
    })

# Health check endpoint (optional)
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

# Application entry point
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=app.config['DEBUG'])
