/**
 * Main Application Logic.
 * Handles DOM interaction and API calls.
 */

console.log("Browser RegEdit initialized.");

let currentPath = "";

document.addEventListener("DOMContentLoaded", () => {
    loadTree();
});

// --- Read Operations ---

function loadTree() {
    fetch('/api/tree')
        .then(response => response.json())
        .then(data => {
            const treeContainer = document.getElementById('tree-panel');
            treeContainer.innerHTML = ''; 
            treeContainer.appendChild(renderTreeNode(data, ""));
        })
        .catch(err => console.error("Error loading tree:", err));
}

function renderTreeNode(node, path) {
    const ul = document.createElement('ul');
    ul.className = 'tree-list';
    if (path === "") ul.style.paddingLeft = "0";

    for (const keyName in node) {
        const li = document.createElement('li');
        const fullPath = path ? `${path}\\${keyName}` : keyName;
        
        const span = document.createElement('span');
        span.className = 'tree-item';
        span.textContent = keyName;
        
        if(fullPath === currentPath) span.classList.add('active');

        span.onclick = (e) => {
            e.stopPropagation();
            selectKey(fullPath, span);
        };

        li.appendChild(span);

        if (Object.keys(node[keyName]).length > 0) {
            li.appendChild(renderTreeNode(node[keyName], fullPath));
        }
        ul.appendChild(li);
    }
    return ul;
}

function selectKey(path, domElement) {
    currentPath = path;
    document.getElementById('display-path').textContent = path;
    
    // Clear inputs and search state
    document.getElementById('new-key-name').value = '';
    document.getElementById('rename-key-input').value = '';
    cancelValueRename();
    clearValueForm();

    document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));
    if(domElement) domElement.classList.add('active');

    loadValues(path);
}

function loadValues(path) {
    fetch(`/api/values?path=${encodeURIComponent(path)}`)
        .then(response => response.json())
        .then(data => {
            renderValuesTable(data.values);
        })
        .catch(err => console.error("Error loading values:", err));
}

function renderValuesTable(values) {
    const listPanel = document.getElementById('list-panel');
    
    if (!values || values.length === 0) {
        listPanel.innerHTML = '<p class="text-muted">No values found.</p>';
        return;
    }

    let html = `
        <table class="table table-hover table-sm border">
            <thead class="table-light">
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Data</th>
                    <th style="width: 140px;">Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    values.forEach(val => {
        const safeName = val.name.replace(/"/g, '&quot;');
        const safeData = String(val.data).replace(/"/g, '&quot;');
        
        html += `
            <tr>
                <td>${val.name}</td>
                <td>${val.type}</td>
                <td class="text-break">${val.data}</td>
                <td>
                    <button class="btn btn-sm btn-link p-0 text-decoration-none" 
                        onclick="fillEditForm('${safeName}', '${val.type}', '${safeData}')">Edit</button>
                    <button class="btn btn-sm btn-link p-0 text-decoration-none text-dark ms-2" 
                        onclick="showValueRename('${safeName}')">Rename</button>
                    <button class="btn btn-sm btn-link p-0 text-decoration-none text-danger ms-2" 
                        onclick="deleteValue('${safeName}')">Del</button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    listPanel.innerHTML = html;
}

// --- Write Operations ---

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
            loadTree();
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
            loadValues(currentPath);
            clearValueForm();
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

function showValueRename(oldName) {
    document.getElementById('rename-value-row').style.display = 'block';
    document.getElementById('rename-val-old').value = oldName;
    document.getElementById('rename-val-new').focus();
}

function cancelValueRename() {
    document.getElementById('rename-value-row').style.display = 'none';
    document.getElementById('rename-val-old').value = '';
    document.getElementById('rename-val-new').value = '';
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
            cancelValueRename();
            loadValues(currentPath);
        }
    });
}

// --- Search Logic ---

function performSearch() {
    const query = document.getElementById('search-input').value;
    const recursive = document.getElementById('search-recursive').checked;
    const listPanel = document.getElementById('list-panel');

    if (!query) {
        alert("Please enter a search query");
        return;
    }

    listPanel.innerHTML = '<p class="text-muted">Searching...</p>';

    fetch(`/api/search?query=${encodeURIComponent(query)}&path=${encodeURIComponent(currentPath)}&recursive=${recursive}`)
        .then(res => res.json())
        .then(results => {
            if (results.length === 0) {
                listPanel.innerHTML = '<div class="alert alert-warning">No results found.</div>';
                return;
            }

            let html = `
                <div class="alert alert-info py-2 mb-2">
                    Found ${results.length} results for "${query}"
                    <button class="btn btn-sm btn-link float-end p-0" onclick="loadValues(currentPath)">Close Search</button>
                </div>
                <table class="table table-bordered table-sm table-striped">
                    <thead>
                        <tr>
                            <th>Location</th>
                            <th>Value Name</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            results.forEach(item => {
                html += `
                    <tr>
                        <td class="small text-muted">${item.location}</td>
                        <td class="fw-bold">${item.name}</td>
                        <td class="text-break">${item.data}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
            listPanel.innerHTML = html;
        })
        .catch(err => {
            console.error(err);
            listPanel.innerHTML = '<p class="text-danger">Search error.</p>';
        });
}

// --- Helpers ---

function fillEditForm(name, type, data) {
    document.getElementById('val-name').value = name;
    document.getElementById('val-type').value = type;
    document.getElementById('val-data').value = data;
}

function clearValueForm() {
    document.getElementById('val-name').value = '';
    document.getElementById('val-data').value = '';
    document.getElementById('val-type').value = 'REG_SZ';
}