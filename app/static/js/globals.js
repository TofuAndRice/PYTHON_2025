/**
 * Global State and Initialization.
 * Defines shared variables used across other files.
 */

console.log("Browser RegEdit: Loading modules...");

// Shared State
let currentPath = "";

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    if (typeof loadTree === "function") {
        loadTree();
    } else {
        console.error("Error: view-tree.js not loaded.");
    }
});