"""
Application Routes.

This module defines the URL endpoints for the web interface and API.
"""

from flask import Blueprint, render_template, jsonify, request
from app import registry_manager

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

@main.route('/api/tree')
def get_tree():
    """
    API Endpoint: Get the full key hierarchy.
    
    Returns:
        JSON: Nested dictionary of keys.
    """
    tree_data = registry_manager.get_tree()
    return jsonify(tree_data)

@main.route('/api/values')
def get_values():
    """
    API Endpoint: Get values for a specific key path.
    
    Query Params:
        path (str): The registry path (e.g. "HKEY_CURRENT_USER\Software")
    
    Returns:
        JSON: List of value objects or error.
    """
    path = request.args.get('path', '')
    key_node = registry_manager.get_key(path)
    
    if key_node is None:
        return jsonify({"error": "Key not found"}), 404
        
    # Convert values dict to a list for easier frontend rendering
    values_list = []
    for name, details in key_node["values"].items():
        values_list.append({
            "name": name,
            "type": details["type"],
            "data": details["data"]
        })
        
    return jsonify({"values": values_list, "path": path})