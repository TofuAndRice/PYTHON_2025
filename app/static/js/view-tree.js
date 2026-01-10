/**
 * Tree View Logic.
 * Handles rendering and interaction for the left-hand registry tree.
 */

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
        
        // Highlight active key if it matches current state
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
    const displayPath = document.getElementById('display-path');
    if (displayPath) displayPath.textContent = path;
    
    // Clear inputs and search state
    const newKeyInput = document.getElementById('new-key-name');
    const renameKeyInput = document.getElementById('rename-key-input');
    
    if (newKeyInput) newKeyInput.value = '';
    if (renameKeyInput) renameKeyInput.value = '';
    
    // Call helpers to reset UI
    if (typeof cancelValueRename === "function") cancelValueRename();
    if (typeof clearValueForm === "function") clearValueForm();

    // Update active visual state
    document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));
    if(domElement) domElement.classList.add('active');

    // Trigger loading of right panel
    if (typeof loadValues === "function") loadValues(path);
}