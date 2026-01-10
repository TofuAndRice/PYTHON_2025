/**
 * Main Application Logic.
 * Handles DOM interaction and API calls.
 */

console.log("Browser RegEdit initialized.");

// State
let currentPath = "";

document.addEventListener("DOMContentLoaded", () => {
    loadTree();
});

/**
 * Fetch and render the registry key hierarchy.
 */
function loadTree() {
    fetch('/api/tree')
        .then(response => response.json())
        .then(data => {
            const treeContainer = document.getElementById('tree-panel');
            treeContainer.innerHTML = ''; // Clear loading text
            treeContainer.appendChild(renderTreeNode(data, ""));
        })
        .catch(err => console.error("Error loading tree:", err));
}

/**
 * Recursive function to build the tree DOM.
 * @param {Object} node - The current node in the tree structure.
 * @param {String} path - The cumulative path to this node.
 */
function renderTreeNode(node, path) {
    const ul = document.createElement('ul');
    ul.className = 'tree-list';
    if (path === "") ul.style.paddingLeft = "0"; // Root level

    for (const keyName in node) {
        const li = document.createElement('li');
        
        // Calculate full path for this key
        const fullPath = path ? `${path}\\${keyName}` : keyName;
        
        // Create the clickable label
        const span = document.createElement('span');
        span.className = 'tree-item';
        span.textContent = keyName;
        span.onclick = (e) => {
            e.stopPropagation(); // Prevent bubbling
            selectKey(fullPath, span);
        };

        li.appendChild(span);

        // Recursively render children if any
        if (Object.keys(node[keyName]).length > 0) {
            li.appendChild(renderTreeNode(node[keyName], fullPath));
        }

        ul.appendChild(li);
    }
    return ul;
}

/**
 * Handle key selection: highlight UI and fetch values.
 */
function selectKey(path, domElement) {
    currentPath = path;
    
    // UI: Update active state
    document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));
    domElement.classList.add('active');

    loadValues(path);
}

/**
 * Fetch and render values for the selected path.
 */
function loadValues(path) {
    fetch(`/api/values?path=${encodeURIComponent(path)}`)
        .then(response => response.json())
        .then(data => {
            renderValuesTable(data.values);
        })
        .catch(err => console.error("Error loading values:", err));
}

/**
 * Render the values table in the right panel.
 */
function renderValuesTable(values) {
    const listPanel = document.getElementById('list-panel');
    
    let html = `<h5>${currentPath || "Root"}</h5>`;
    
    if (!values || values.length === 0) {
        html += '<p class="text-muted">No values found.</p>';
        listPanel.innerHTML = html;
        return;
    }

    html += `
        <table class="table table-hover table-sm">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Data</th>
                </tr>
            </thead>
            <tbody>
    `;

    values.forEach(val => {
        html += `
            <tr>
                <td>${val.name}</td>
                <td>${val.type}</td>
                <td class="text-break">${val.data}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    listPanel.innerHTML = html;
}