"""
Flask Application Factory.

This module initializes the Flask app and registers the routes blueprint.
"""

from flask import Flask

def create_app():
    """
    Create and configure the Flask application.

    Returns:
        Flask: The configured Flask application instance.
    """
    app = Flask(__name__)

    # Import and register routes
    from app.routes import main
    app.register_blueprint(main)

    return app