"""
Flask Application Factory.

This module initializes the Flask app, the Registry backend, and registers routes.
"""

from flask import Flask

# Create a global instance of the RegistryManager
# This ensures all routes access the same data in memory.
from app.registry import RegistryManager

registry_manager = RegistryManager()

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