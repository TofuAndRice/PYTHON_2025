"""
Registry Backend Abstraction.

This module handles the storage, validation, and manipulation of the 
mock Windows Registry data structure.
"""

class RegistryTypes:
    """Allowed registry value types."""
    STR = "REG_SZ"
    DWORD = "REG_DWORD"
    MULTI_SZ = "REG_MULTI_SZ"
    BINARY = "REG_BINARY"

class RegistryManager:
    """
    Manages the in-memory representation of the registry.
    """

    def __init__(self):
        """
        Initialize the registry with default root keys.
        """
        self.root = {
            "subkeys": {
                "HKEY_LOCAL_MACHINE": {
                    "subkeys": {
                        "SOFTWARE": {"subkeys": {}, "values": {}},
                        "SYSTEM": {"subkeys": {}, "values": {}}
                    }, 
                    "values": {}
                },
                "HKEY_CURRENT_USER": {
                    "subkeys": {
                        "Control Panel": {"subkeys": {}, "values": {}},
                        "Software": {"subkeys": {}, "values": {}}
                    }, 
                    "values": {}
                },
            },
            "values": {}
        }
        self._seed_data()

    def _seed_data(self):
        """Populate registry with some example values."""
        hkcu_software = self.root["subkeys"]["HKEY_CURRENT_USER"]["subkeys"]["Software"]
        hkcu_software["values"]["Version"] = {
            "type": RegistryTypes.STR, 
            "data": "1.0.0"
        }
        hkcu_software["values"]["Installed"] = {
            "type": RegistryTypes.DWORD, 
            "data": 1
        }

    def get_key(self, path):
        """Navigate to a specific key based on a path string."""
        if not path:
            return self.root

        parts = [p for p in path.split('\\') if p]
        current = self.root
        for part in parts:
            if "subkeys" in current and part in current["subkeys"]:
                current = current["subkeys"][part]
            else:
                return None
        return current

    def get_tree(self):
        """Return the full hierarchy of keys (names only, nested)."""
        def build_structure(node):
            return {k: build_structure(v) for k, v in node["subkeys"].items()}
        return build_structure(self.root)

    def create_key(self, path, new_key_name):
        """Create a new subkey under the given path."""
        parent = self.get_key(path)
        if parent is None:
            return False, "Parent key not found"
        
        if new_key_name in parent["subkeys"]:
            return False, "Key already exists"
            
        parent["subkeys"][new_key_name] = {"subkeys": {}, "values": {}}
        return True, "Key created"

    def delete_key(self, path):
        """Delete the key at the specified path."""
        if not path or '\\' not in path:
            return False, "Cannot delete root or top-level hives"
            
        parent_path, key_name = path.rsplit('\\', 1)
        parent = self.get_key(parent_path)
        
        if parent and key_name in parent["subkeys"]:
            del parent["subkeys"][key_name]
            return True, "Key deleted"
        return False, "Key not found"

    def rename_key(self, path, new_name):
        """Rename a key. Returns (Success, Message, NewPath)."""
        if not path or '\\' not in path:
            return False, "Cannot rename root or top-level hives", path

        parent_path, old_name = path.rsplit('\\', 1)
        parent = self.get_key(parent_path)

        if not parent or old_name not in parent["subkeys"]:
            return False, "Key not found", path

        if new_name in parent["subkeys"]:
            return False, "Name already exists", path

        parent["subkeys"][new_name] = parent["subkeys"].pop(old_name)
        new_path = f"{parent_path}\\{new_name}"
        return True, "Key renamed", new_path

    def set_value(self, path, name, val_type, data):
        """Create or update a value within a specific key."""
        key_node = self.get_key(path)
        if key_node is None:
            return False, "Key path not found"
            
        key_node["values"][name] = {
            "type": val_type,
            "data": data
        }
        return True, "Value saved"

    def delete_value(self, path, name):
        """Delete a value from a specific key."""
        key_node = self.get_key(path)
        if key_node and name in key_node["values"]:
            del key_node["values"][name]
            return True, "Value deleted"
        return False, "Value not found"

    def rename_value(self, path, old_name, new_name):
        """Rename a value within a key."""
        key_node = self.get_key(path)
        if key_node is None:
            return False, "Key path not found"

        if old_name not in key_node["values"]:
            return False, "Value not found"
            
        if new_name in key_node["values"]:
            return False, "Value name already exists"

        key_node["values"][new_name] = key_node["values"].pop(old_name)
        return True, "Value renamed"

    def search_values(self, start_path, query, recursive=False):
        """
        Search for values containing the query string (in name or data).
        
        Returns:
            list: List of dicts {path, name, type, data}
        """
        results = []
        query = query.lower()
        
        # Helper to process a single node
        def process_node(current_path, node):
            # Check values in this node
            for name, details in node["values"].items():
                val_data = str(details["data"])
                if query in name.lower() or query in val_data.lower():
                    results.append({
                        "location": current_path,
                        "name": name,
                        "type": details["type"],
                        "data": details["data"]
                    })
            
            # Recurse if requested
            if recursive:
                for sub_name, sub_node in node["subkeys"].items():
                    sub_path = f"{current_path}\\{sub_name}" if current_path else sub_name
                    process_node(sub_path, sub_node)

        start_node = self.get_key(start_path)
        if start_node:
            process_node(start_path, start_node)
            
        return results