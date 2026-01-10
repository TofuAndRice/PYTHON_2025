/**
 * Actions & Operations.
 * Handles Create, Update, Delete, and Rename logic (API calls).
 */

// --- Key Operations ---

function createKey() {
    const name = document.getElementById('new-key-name').value;
    if(!name) return;

    fetch('/api/keys', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ path: currentPath, name: name })
    })
    .then(res => res.json())
    .then(data => {
        if(data.error) alert(data.error);
        else {
            loadTree(); // from view-tree.js
            document.getElementById('new-key-name').value = '';
        }
    });
}

function deleteCurrentKey() {
    if(!confirm("Are you sure you want to delete this key and all subkeys?")) return;

    fetch('/api/keys', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ path: currentPath })
    })
    .then(res => res.json())
    .then(data => {
        if(data.error) alert(data.error);
        else {
            currentPath = ""; 
            document.getElementById('display-path').textContent = "Root";
            document.getElementById('list-panel').innerHTML = "";
            loadTree();
        }
    });
}

function renameCurrentKey() {
    const newName = document.getElementById('rename-key-input').value;
    if(!newName) return;

    fetch('/api/rename', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
            path: currentPath, 
            type: 'key',
            new_name: newName 
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.error || !data.success) alert(data.error || "Rename failed");
        else {
            currentPath = data.new_path;
            document.getElementById('display-path').textContent = currentPath;
            document.getElementById('rename-key-input').value = '';
            loadTree(); 
        }
    });
}

// --- Value Operations ---

function saveValue() {
    const name = document.getElementById('val-name').value;
    const type = document.getElementById('val-type').value;
    const data = document.getElementById('val-data').value;

    if(!name) return;

    fetch('/api/values', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ path: currentPath, name: name, type: type, data: data })
    })
    .then(res => res.json())
    .then(data => {
        if(data.error) alert(data.error);
        else {
            loadValues(currentPath); // from view-list.js
            clearValueForm(); // from helpers.js
        }
    });
}

function deleteValue(name) {
    if(!confirm(`Delete value "${name}"?`)) return;

    fetch('/api/values', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ path: currentPath, name: name })
    })
    .then(res => res.json())
    .then(data => {
        if(data.error) alert(data.error);
        else loadValues(currentPath);
    });
}

function performValueRename() {
    const oldName = document.getElementById('rename-val-old').value;
    const newName = document.getElementById('rename-val-new').value;
    
    if(!newName) return;

    fetch('/api/rename', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
            path: currentPath, 
            type: 'value',
            old_name: oldName,
            new_name: newName 
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.error || !data.success) alert(data.error || "Rename failed");
        else {
            cancelValueRename(); // from helpers.js
            loadValues(currentPath);
        }
    });
}