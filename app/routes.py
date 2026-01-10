"""
Application Routes.

This module defines the URL endpoints for the web interface and API.
"""

from flask import Blueprint, render_template

# Define the main blueprint
main = Blueprint('main', __name__)

@main.route('/')
def index():
    """
    Render the main application interface.

    Returns:
        str: The rendered HTML for the index page.
    """
    return render_template('index.html')