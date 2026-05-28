const USERS_DB_URL = "https://join-45b16-default-rtdb.europe-west1.firebasedatabase.app/users.json";

let users = [];
let selectedPriority = "medium";

/**
 * Lädt alle User aus Firebase
 */
async function loadUsersForBoard() {

    try {

        const response = await fetch(USERS_DB_URL);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data) {
            users = [];
            return;
        }

        users = Object.entries(data).map(([key, user]) => ({
            id: key,
            name: user.name || "Unknown"
        }));

        populateAssignedToDropdown();

    } catch (error) {

        console.error("Error loading users:", error);
        users = [];

    }

}

/**
 * Füllt Assigned-To Dropdown
 */
function populateAssignedToDropdown() {

    const select = document.getElementById("assignedTo");

    if (!select) return;

    select.innerHTML = `
        <option value="">Select contacts to assign</option>
    `;

    users.forEach(user => {

        select.innerHTML += `
            <option value="${user.name}">
                ${user.name}
            </option>
        `;

    });

}

/**
 * Füllt Category Dropdown
 */
function populateCategoryDropdown() {

    const select = document.getElementById("category");

    if (!select) return;

    select.innerHTML = `
        <option value="">Select task category</option>
        <option value="Technical Task">Technical Task</option>
        <option value="User Story">User Story</option>
    `;

}

/**
 * Initialisiert Priority Buttons
 */
function initPriorityButtons() {

    const buttons = document.querySelectorAll(".priorityButton");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            if (button.classList.contains("high")) {
                selectedPriority = "urgent";
            }

            else if (button.classList.contains("medium")) {
                selectedPriority = "medium";
            }

            else if (button.classList.contains("low")) {
                selectedPriority = "low";
            }

        });

    });

}

/**
 * Validiert Formular
 */
function validateBoardTaskForm() {

    const title = document.getElementById("title").value.trim();
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;

    if (!title) {
        alert("Please enter a title");
        return false;
    }

    if (!date) {
        alert("Please select a due date");
        return false;
    }

    if (!category) {
        alert("Please select a category");
        return false;
    }

    return true;

}

/**
 * Task erstellen
 */
async function createTask() {

    if (!validateBoardTaskForm()) return;

    const title = document.getElementById("title").value.trim();

    const description = document.getElementById("des").value.trim();

    const date = document.getElementById("date").value;

    const assignedTo = document.getElementById("assignedTo").value;

    const category = document.getElementById("category").value;

    const subtaskInput = document.getElementById("subtask").value.trim();

    const newTask = {

        title: title,

        description: description,

        dueDate: date,

        status: "todo",

        priority: selectedPriority,

        assignedTo: assignedTo ? [assignedTo] : [],

        category: category,

        subtasks: subtaskInput
            ? [{
                id: 1,
                title: subtaskInput,
                completed: false
            }]
            : [],

        createdAt: new Date().toISOString()

    };

    try {

        const response = await fetch(TASKS_DB_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(newTask)

        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        console.log("Task created successfully");

        await loadTasksFromFirebase();

        renderBoard();

        clearBoardTaskForm();

        closeAddTask();

    } catch (error) {

        console.error("Error creating task:", error);

        alert("Task could not be created.");

    }

}

/**
 * Formular leeren
 */
function clearBoardTaskForm() {

    document.getElementById("title").value = "";

    document.getElementById("des").value = "";

    document.getElementById("date").value = "";

    document.getElementById("assignedTo").value = "";

    document.getElementById("category").value = "";

    document.getElementById("subtask").value = "";

}

/**
 * Initialisiert kompletten Add Task Dialog
 */
async function initBoardAddTask() {

    await loadUsersForBoard();

    populateCategoryDropdown();

    initPriorityButtons();

}