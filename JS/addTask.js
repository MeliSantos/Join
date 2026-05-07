// Firebase URLs
const USERS_DB_URL = "https://join-45b16-default-rtdb.europe-west1.firebasedatabase.app/users.json";
const TASKS_DB_URL = "https://join-45b16-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

// State
let users = [];
let selectedPriority = "low";

/**
 * Initialize the Add Task page
 */
async function initAddTask() {
    try {
        await loadUsers();
        populateAssignedToDropdown();
        populateCategoryDropdown();
        setupEventListeners();
    } catch (error) {
        console.error("Error initializing Add Task page:", error);
    }
}

/**
 * Load users from Firebase
 */
async function loadUsers() {
    try {
        const response = await fetch(USERS_DB_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (!data) {
            users = [];
            return;
        }
        
        // Convert Firebase object to array
        users = Object.entries(data).map(([key, user]) => ({
            id: key,
            name: user.name || "Unknown",
            email: user.email || "",
            initials: user.initials || user.name.charAt(0).toUpperCase()
        }));
        
        console.log("Loaded users:", users);
    } catch (error) {
        console.error("Error loading users:", error);
        users = [];
    }
}

/**
 * Populate the "Assigned to" dropdown with users
 */
function populateAssignedToDropdown() {
    const select = document.getElementById("assignedTo");
    if (!select) return;
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add user options
    users.forEach(user => {
        const option = document.createElement("option");
        option.value = user.name;
        option.textContent = user.name;
        select.appendChild(option);
    });
}

/**
 * Populate the Category dropdown
 */
function populateCategoryDropdown() {
    const categories = ["User Story", "Technical Task"];
    const select = document.getElementById("category");
    if (!select) return;
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

/**
 * Setup event listeners for the form
 */
function setupEventListeners() {
    // Priority buttons
    const priorityButtons = document.querySelectorAll(".priorityButton");
    priorityButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            selectPriority(button);
        });
    });
    
    // Create Task button
    const createButton = document.getElementById("createTaskBtn");
    if (createButton) {
        createButton.addEventListener("click", createTask);
    }
    
    // Clear button
    const clearButton = document.getElementById("guestLogIn");
    if (clearButton) {
        clearButton.addEventListener("click", clearForm);
    }
}

/**
 * Handle priority selection
 */
function selectPriority(button) {
    // Remove active state from all buttons
    document.querySelectorAll(".priorityButton").forEach(btn => {
        btn.style.backgroundColor = "#FFFFFF";
        btn.style.color = "#2A3647";
    });
    
    // Add active state to selected button
    button.style.backgroundColor = "#FFA800";
    button.style.color = "#FFFFFF";
    
    // Get priority level from button class
    if (button.classList.contains("low")) {
        selectedPriority = "low";
    } else if (button.classList.contains("medium")) {
        selectedPriority = "medium";
    } else if (button.classList.contains("high")) {
        selectedPriority = "urgent";
    }
}

/**
 * Validate the form
 */
function validateForm() {
    const title = document.getElementById("title").value.trim();
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    
    if (!title) {
        alert("Please enter a title");
        return false;
    }
    
    if (!date) {
        alert("Please select a date");
        return false;
    }
    
    if (!category) {
        alert("Please select a category");
        return false;
    }
    
    return true;
}

/**
 * Create a new task
 */
async function createTask(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("des").value.trim();
    const date = document.getElementById("date").value;
    const assignedTo = document.getElementById("assignedTo").value;
    const category = document.getElementById("category").value;
    const subtaskInput = document.getElementById("subtask").value.trim();
    
    const task = {
        title: title,
        description: description,
        dueDate: date,
        status: "todo",
        priority: selectedPriority,
        assignedTo: assignedTo ? [assignedTo] : [],
        category: category,
        subtasks: subtaskInput ? [{ id: 1, title: subtaskInput, completed: false }] : [],
        createdAt: new Date().toISOString()
    };
    
    try {
        const response = await fetch(TASKS_DB_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(task)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Task created with ID:", result.name);
        
        alert("Task created successfully!");
        clearForm();
        
        // Optionally redirect to board after a short delay
        // setTimeout(() => {
        //     window.location.href = "board.html";
        // }, 1000);
        
    } catch (error) {
        console.error("Error creating task:", error);
        alert("Error creating task. Please try again.");
    }
}

/**
 * Clear the form
 */
function clearForm() {
    document.getElementById("title").value = "";
    document.getElementById("des").value = "";
    document.getElementById("date").value = "";
    document.getElementById("assignedTo").value = "";
    document.getElementById("category").value = "";
    document.getElementById("subtask").value = "";
    selectedPriority = "low";
    
    // Reset priority buttons
    document.querySelectorAll(".priorityButton").forEach(btn => {
        btn.style.backgroundColor = "#FFFFFF";
        btn.style.color = "#2A3647";
    });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initAddTask);
    