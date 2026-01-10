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
        # The data structure:
        # A Key is a dict: { "subkeys": {}, "values": {} }
        # "subkeys" is a dict of KeyName -> Key
        # "values" is a dict of ValueName -> { "type": ..., "data": ... }
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
        
        # Populate some initial dummy data for testing Phase 2 later
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
        """
        Navigate to a specific key based on a path string.

        Args:
            path (str): The path to the key (e.g., 'HKEY_CURRENT_USER\\Software').
                        Use empty string or None for root.

        Returns:
            dict: The key dictionary or None if not found.
        """
        if not path:
            return self.root

        # Split path by backslash
        parts = [p for p in path.split('\\') if p]
        
        current = self.root
        for part in parts:
            if "subkeys" in current and part in current["subkeys"]:
                current = current["subkeys"][part]
            else:
                return None
        
        return current