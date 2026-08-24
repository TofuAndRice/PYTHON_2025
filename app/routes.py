"""
Application Routes.

This module defines the URL endpoints for the web interface and API.
"""

from flask import Blueprint, render_template, jsonify, request
from app import registry_manager

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/api/tree')
def get_tree():
    tree_data = registry_manager.get_tree()
    return jsonify(tree_data)

@main.route('/api/values')
def get_values():
    path = request.args.get('path', '')
    key_node = registry_manager.get_key(path)
    
    if key_node is None:
        return jsonify({"error": "Key not found"}), 404
        
    values_list = []
    for name, details in key_node["values"].items():
        values_list.append({
            "name": name,
            "type": details["type"],
            "data": details["data"]
        })
        
    return jsonify({"values": values_list, "path": path})

@main.route('/api/keys', methods=['POST', 'DELETE'])
def manage_keys():
    """Handle creation and deletion of keys."""
    data = request.json
    path = data.get('path', '')
    
    if request.method == 'POST':
        name = data.get('name')
        if not name:
            return jsonify({"error": "Name required"}), 400
        success, msg = registry_manager.create_key(path, name)
        
    elif request.method == 'DELETE':
        success, msg = registry_manager.delete_key(path)
        
    if success:
        return jsonify({"message": msg})
    return jsonify({"error": msg}), 400

@main.route('/api/values', methods=['POST', 'DELETE'])
def manage_values():
    """Handle creation, update, and deletion of values."""
    data = request.json
    path = data.get('path', '')
    name = data.get('name')
    
    if not name:
        return jsonify({"error": "Name required"}), 400

    if request.method == 'POST':
        val_type = data.get('type')
        val_data = data.get('data')
        success, msg = registry_manager.set_value(path, name, val_type, val_data)
        
    elif request.method == 'DELETE':
        success, msg = registry_manager.delete_value(path, name)
        
    if success:
        return jsonify({"message": msg})
    return jsonify({"error": msg}), 400

@main.route('/api/rename', methods=['PUT'])
def rename_item():
    """Handle renaming of keys and values."""
    data = request.json
    path = data.get('path', '')
    target_type = data.get('type')
    new_name = data.get('new_name')
    
    if not new_name:
        return jsonify({"error": "New name required"}), 400

    if target_type == 'key':
        success, msg, new_path = registry_manager.rename_key(path, new_name)
        return jsonify({"success": success, "message": msg, "new_path": new_path})
        
    elif target_type == 'value':
        old_name = data.get('old_name')
        success, msg = registry_manager.rename_value(path, old_name, new_name)
        return jsonify({"success": success, "message": msg})
    
    return jsonify({"error": "Invalid type"}), 400

@main.route('/api/search')
def search():
    """
    Handle search requests.
    
    Query Params:
        query (str): The text to search for.
        path (str): The starting key path.
        recursive (bool): 'true' to search subkeys.
    """
    query = request.args.get('query', '')
    path = request.args.get('path', '')
    recursive = request.args.get('recursive') == 'true'
    
    if not query:
        return jsonify([])
        
    results = registry_manager.search_values(path, query, recursive)
    return jsonify(results)