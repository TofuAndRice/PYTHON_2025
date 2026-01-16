/**
 * UI Helper Functions.
 * Handles form population, clearing, and toggle logic.
 */

function toggleInputType() {
    const type = document.getElementById('val-type').value;
    const singleInput = document.getElementById('val-data');
    const multiInput = document.getElementById('val-data-multi');

    if (type === 'REG_MULTI_SZ') {
        singleInput.style.display = 'none';
        multiInput.style.display = 'block';
    } else {
        singleInput.style.display = 'block';
        multiInput.style.display = 'none';
    }
}

function fillEditForm(name, type, data) {
    document.getElementById('val-name').value = name;
    document.getElementById('val-type').value = type;
    
    // Ensure the correct input is shown
    toggleInputType();

    if (type === 'REG_MULTI_SZ') {
        document.getElementById('val-data-multi').value = data;
        document.getElementById('val-data').value = ''; 
    } else {
        document.getElementById('val-data').value = data;
        document.getElementById('val-data-multi').value = '';
    }
}

function clearValueForm() {
    document.getElementById('val-name').value = '';
    document.getElementById('val-data').value = '';
    document.getElementById('val-data-multi').value = '';
    
    // Reset to default
    document.getElementById('val-type').value = 'REG_SZ';
    toggleInputType();
}

function showValueRename(oldName) {
    const row = document.getElementById('rename-value-row');
    const oldInput = document.getElementById('rename-val-old');
    const newInput = document.getElementById('rename-val-new');

    if (row) row.style.display = 'block';
    if (oldInput) oldInput.value = oldName;
    if (newInput) newInput.focus();
}

function cancelValueRename() {
    const row = document.getElementById('rename-value-row');
    const oldInput = document.getElementById('rename-val-old');
    const newInput = document.getElementById('rename-val-new');

    if (row) row.style.display = 'none';
    if (oldInput) oldInput.value = '';
    if (newInput) newInput.value = '';
}