const TASKS_DB_URL = "https://join-45b16-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

let tasks = [
  {
    id: 0,
    title: "CSS Architecture Planning",
    description: "Define SCSS naming conventions",
    dueDate: "2023-10-23",
    status: "inProgress",
    priority: "urgent",
    assignedTo: ["Sofia Müller"],
    category: "Technical Task",
    subtasks: [
      { id: 1, title: "Research BEM vs SMACSS", completed: false },
      { id: 2, title: "Draft naming guidelines", completed: false }
    ]
  },
  {
    id: 1,
    title: "Test Task 2",
    description: "Noch eine Aufgabe",
    dueDate: "2023-10-25",
    status: "todo",
    priority: "low",
    assignedTo: ["Max Mustermann", "Sofia Müller"],
    category: "User Story",
    subtasks: []
  }
];

let currentDraggedTaskId;
let currentUser = null;

async function init() {
  // Load current user from localStorage
  const userJSON = localStorage.getItem("currentUser");
  if (userJSON) {
    currentUser = JSON.parse(userJSON);
    console.log("Current user:", currentUser.name);
  }
  
  // Load tasks from Firebase
  await loadTasksFromFirebase();
  renderBoard();
}

/**
 * Load tasks from Firebase Realtime Database
 */
async function loadTasksFromFirebase() {
  try {
    const response = await fetch(TASKS_DB_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (!data) {
      tasks = [];
      tasksMap = {};
      return;
    }
    
    // Convert Firebase object to array
    tasks = Object.entries(data).map(([key, task]) => ({
      id: key,
      ...task
    }));
    
    // Store tasks in map for quick lookup
    tasksMap = Object.assign({}, data);
    
    console.log("Loaded tasks from Firebase:", tasks);
  } catch (error) {
    console.error("Error loading tasks from Firebase:", error);
    tasks = [];
    tasksMap = {};
  }
}

/**
 * Get filtered tasks based on current user
 */
function getFilteredTasks() {
  if (!currentUser || currentUser.name === "Guest") {
    return tasks; // Guests see all tasks
  }
  
  return tasks.filter(task => {
    // Show task if user is in assignedTo array
    return task.assignedTo && task.assignedTo.includes(currentUser.name);
  });
}

function renderBoard() {
  document.getElementById("todo").innerHTML = "";
  document.getElementById("inProgress").innerHTML = "";
  document.getElementById("awaitingFeedback").innerHTML = "";
  document.getElementById("done").innerHTML = "";

  tasks.forEach(task => {
    let card = createTaskCard(task);

    if (task.status === "todo") {
      document.getElementById("todo").appendChild(card);
    }
    else if (task.status === "inProgress") {
      document.getElementById("inProgress").appendChild(card);
    }
    else if (task.status === "awaitingFeedback") {
      document.getElementById("awaitingFeedback").appendChild(card);
    }
    else if (task.status === "done") {
      document.getElementById("done").appendChild(card);
    }
  });
  updateNoTaskMessages();
}

function getSubtaskProgress(subtasks) { // muss ggf verändert werden, wenn ich die Subtasks in der Task-Dialogbox bearbeitbar machen möchte
  if (!subtasks || subtasks.length === 0) return "0/0";

  let done = subtasks.filter(st => st.completed).length;
  return `${done}/${subtasks.length}`;
}

function getProgressPercent(subtasks) {
  if (!subtasks || subtasks.length === 0) return 0;

  let done = subtasks.filter(st => st.completed).length;
  return (done / subtasks.length) * 100;
}

function startDragging(id) {
  currentDraggedTaskId = id;
}

function dragoverHandler(ev) {
  ev.preventDefault();
}

async function moveTo(status) {
  const taskId = currentDraggedTaskId;
  
  // Find task in array
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  // Update local state
  task.status = status;
  
  // Update in Firebase
  try {
    const updateUrl = `${TASKS_DB_URL.replace('.json', '')}/${taskId}.json`;
    const response = await fetch(updateUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: status })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    console.log("Task status updated in Firebase");
    renderBoard();
  } catch (error) {
    console.error("Error updating task status:", error);
    alert("Error updating task. Please try again.");
  }
}


function createTaskCard(task) {
  let card = document.createElement("div");
  card.classList.add("task-card");

  let progress = getSubtaskProgress(task.subtasks);
  let progressPercent = getProgressPercent(task.subtasks);

  let assignedHTML = (task.assignedTo || [])
    .map(name => `<span class="avatar">${getInitials(name)}</span>`)
    .join("");

  let priorityIcon = getPriorityIcon(task.priority);

  card.innerHTML = `
  <div draggable="true" ondragstart="startDragging('${task['id']}')">
    <div class="category ${task.category.replace(' ', '')}">
      ${task.category}
    </div>

    <h3>${task.title}</h3>
    <p class="description">${task.description}</p>

    <div class="subtask-section">
      <div class="progress-bar">
        <div class="progress" style="width: ${progressPercent}%"></div>
      </div>
      <span class="progress-text">${progress} Subtasks</span>
    </div>

    <div class="card-footer">
      <div class="assigned-to">
        ${assignedHTML}
      </div>
      <div class="priority">
        <img src="${priorityIcon}" alt="${task.priority}">
      </div>
     </div>
   </div>
  `;

  card.onclick = () => openTaskDialog(task);

  return card;
}

function getPriorityIcon(priority) {
  if (priority === "urgent") return "./assets/img/urgent.png";
  if (priority === "medium") return "./assets/img/medium.png";
  if (priority === "low") return "./assets/img/low.png";
}

function priorityWord(priority) {
  if (priority === "urgent") return "Urgent";
  if (priority === "medium") return "Medium";
  if (priority === "low") return "Low";
}

function openTaskDialog(task) {
  let dialog = document.getElementById("taskDialog");

  let priorityIcon = getPriorityIcon(task.priority);

  let assignedHTML = (task.assignedTo || [])
    .map(name => `
      <div class="assigned-user">
        <span class="avatar">${getInitials(name)}</span>
        ${name}
      </div>
    `).join("");

  let subtasksHTML = (task.subtasks || []).map(st => `
    <div>
      <input class="subtaskCheckbox" type="checkbox" ${st.completed ? "checked" : ""}>
      <span>${st.title}</span>
    </div>
  `).join("");

  dialog.innerHTML = `
  <div class="taskDialogContent"> 
    <div class="dialogHeader">
      <div class="category catFontSize ${task.category.replace(' ', '')}">
       ${task.category}
      </div> 
      <button class="close-btn" onclick="closeTaskDialog()"> <img src="../assets/img/close.svg" alt="Close"> </button>
    </div> 

    <div>
    <h2>${task.title}</h2>
    </div>

    <div>
    <p class="subtitleDialogue">${task.description}</p>
    </div>

    <div>
    <p class="descriptionDialogue">Due date: <span class="date">${task.dueDate}</span></p>
    </div>

    <div>
    <p class="descriptionDialogue">Priority: <span class="priority">${priorityWord(task.priority)}</span>
      <img src="${priorityIcon}" style="width:16px; vertical-align:middle;">
    </p>
    </div>


    <div class="assigned-to descriptionDialogue">
      <p class="margin">Assigned To:</p>
      ${assignedHTML}
    </div>

    <div class="subtasks descriptionDialogue">
      <p class="margin">Subtasks:</p>
      ${subtasksHTML || "No subtasks"}
    </div>
    <div class="dialogFooterPosition">
    <div class="dialogFooter">
    <div> <img src="../assets/img/delete.svg" alt="Delete"> Delete </div>
    <div class="footerLine">  </div>
    <div> <img src="../assets/img/edit.svg" alt="Edit"> Edit </div>
    </div>
    </div>
  </div>
  `;

  document.getElementById("taskDialogOverlay").classList.add("open");
  dialog.classList.add("open");
}

function closeTaskDialog() {
  document.getElementById("taskDialog").classList.remove("open");
  document.getElementById("taskDialogOverlay").classList.remove("open");
}

function getInitials(name) {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();
}

function createTask() { // muss ich noch bearbeiten, damit die richtigen Daten auch wirklich in das Objekt kommen
  let title = document.getElementById("taskTitle").value;
  let description = document.getElementById("taskDescription").value;
  let dueDate = document.getElementById("taskDate").value;
  let priority = document.getElementById("taskPriority").value;

  if (!title) return alert("Title required");

  let newTask = {
    id: Date.now(),
    title,
    description,
    dueDate,
    status: "todo",
    priority,
    assignedTo: ["Guest"],
    category: "General",
    subtasks: []
  };

  tasks.push(newTask);
  renderBoard();
  closeAddTask();
}

function openAddTask() {
  document.getElementById("addTaskPanel").classList.add("open");
  document.getElementById("addTaskOverlay").classList.add("open");
}

function closeAddTask() {
  document.getElementById("addTaskPanel").classList.remove("open");
  document.getElementById("addTaskOverlay").classList.remove("open");
}

function updateNoTaskMessages() {
  toggleNoTask("todo", "noTaskTodo");
  toggleNoTask("inProgress", "noTaskInProgress");
  toggleNoTask("awaitingFeedback", "noTaskAwaitingFeedback");
  toggleNoTask("done", "noTaskDone");
}

function toggleNoTask(columnId, messageId) {
  let column = document.getElementById(columnId);
  let message = document.getElementById(messageId);

  if (column.children.length === 0) {
    message.style.display = "flex";
  } else {
    message.style.display = "none";
  }
}