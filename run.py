"""
Entry point for the Browser RegEdit application.

This script imports the Flask application instance and runs it.
"""

from app import create_app

if __name__ == "__main__":
    app = create_app()
    # Debug mode is enabled to assist the beginner developer with errors.
    app.run(debug=True, port=5000)