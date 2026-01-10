/**
 * UI Helper Functions.
 * Handles form population, clearing, and toggle logic.
 */

function fillEditForm(name, type, data) {
    document.getElementById('val-name').value = name;
    document.getElementById('val-type').value = type;
    document.getElementById('val-data').value = data;
}

function clearValueForm() {
    const nameInput = document.getElementById('val-name');
    const dataInput = document.getElementById('val-data');
    const typeInput = document.getElementById('val-type');

    if (nameInput) nameInput.value = '';
    if (dataInput) dataInput.value = '';
    if (typeInput) typeInput.value = 'REG_SZ';
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