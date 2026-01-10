/**
 * List View Logic.
 * Handles rendering the right-hand value table and search results.
 */

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

function performSearch() {
    const queryInput = document.getElementById('search-input');
    const recursiveCheck = document.getElementById('search-recursive');
    const listPanel = document.getElementById('list-panel');

    const query = queryInput ? queryInput.value : '';
    const recursive = recursiveCheck ? recursiveCheck.checked : false;

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