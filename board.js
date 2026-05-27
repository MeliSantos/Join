const TASKS_DB_URL = "https://join-45b16-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

let tasks = [
  {
    id: "0",
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
  }
];

let currentDraggedTaskId;
let currentUser = null;
let tasksMap = {};

let selectedPriority = "medium";
let priorityInitialized = false;

async function init() {

  // current user laden
  const userJSON = localStorage.getItem("currentUser");

  if (userJSON) {
    currentUser = JSON.parse(userJSON);
    console.log("Current user:", currentUser.name);
  }

  // tasks laden
  await loadTasksFromFirebase();

  renderBoard();

  // create task button verbinden
  document
    .getElementById("createTaskBtn")
    .addEventListener("click", createTask);
}

/**
 * Tasks aus Firebase laden
 */
async function loadTasksFromFirebase() {

  try {

    const response = await fetch(TASKS_DB_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data) {
      console.log("No Firebase tasks found");
      tasks = [];
      return;
    }

    // Firebase Objekt -> Array
    tasks = Object.entries(data).map(([key, task]) => ({
      id: key,
      ...task
    }));

    tasksMap = Object.assign({}, data);

    console.log("Loaded tasks:", tasks);

  } catch (error) {

    console.error("Error loading tasks:", error);

    tasks = [];
    tasksMap = {};
  }
}

/**
 * Board rendern
 */
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

/**
 * Task Card erstellen
 */
function createTaskCard(task) {

  let card = document.createElement("div");

  card.classList.add("task-card");

  let progress = getSubtaskProgress(task.subtasks);

  let progressPercent = getProgressPercent(task.subtasks);

  let assignedHTML = (task.assignedTo || [])
    .map(name => `
      <span class="avatar">
        ${getInitials(name)}
      </span>
    `)
    .join("");

  let priorityIcon = getPriorityIcon(task.priority);

  card.innerHTML = `
  
    <div draggable="true"
         ondragstart="startDragging('${task.id}')">

      <div class="category ${task.category.replace(' ', '')}">
        ${task.category}
      </div>

      <h3>${task.title}</h3>

      <p class="description">
        ${task.description}
      </p>

      ${task.subtasks && task.subtasks.length > 0 ? `

      <div class="subtask-section">

        <div class="progress-bar">
          <div class="progress"
               style="width:${progressPercent}%">
          </div>
        </div>

        <span class="progress-text">
          ${progress} Subtasks
        </span>

      </div>

      ` : ""}

      <div class="card-footer">

        <div class="assigned-to">
          ${assignedHTML}
        </div>

        <div class="priority">
          <img src="${priorityIcon}">
        </div>

      </div>

    </div>
  `;

  card.onclick = () => openTaskDialog(task);

  return card;
}

/**
 * Priority Icon
 */
function getPriorityIcon(priority) {

  if (priority === "urgent") {
    return "./assets/img/urgent.png";
  }

  if (priority === "medium") {
    return "./assets/img/medium.png";
  }

  if (priority === "low") {
    return "./assets/img/low.png";
  }
}

/**
 * Priority Text
 */
function priorityStatus(priority) {

  if (priority === "urgent") return "Urgent";

  if (priority === "medium") return "Medium";

  if (priority === "low") return "Low";
}

/**
 * Subtask Progress
 */
function getSubtaskProgress(subtasks) {

  if (!subtasks || subtasks.length === 0) {
    return "0/0";
  }

  let done = subtasks.filter(st => st.completed).length;

  return `${done}/${subtasks.length}`;
}

function getProgressPercent(subtasks) {

  if (!subtasks || subtasks.length === 0) {
    return 0;
  }

  let done = subtasks.filter(st => st.completed).length;

  return (done / subtasks.length) * 100;
}

/**
 * Dragging
 */
function startDragging(id) {
  currentDraggedTaskId = id;
}

function dragoverHandler(ev) {
  ev.preventDefault();
}

/**
 * Task verschieben
 */
async function moveTo(status) {

  const taskId = currentDraggedTaskId;

  const task = tasks.find(t => t.id === taskId);

  if (!task) return;

  task.status = status;

  try {

    const updateUrl =
      `${TASKS_DB_URL.replace('.json', '')}/${taskId}.json`;

    const response = await fetch(updateUrl, {

      method: "PATCH",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        status: status
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    renderBoard();

  } catch (error) {

    console.error("Error updating task:", error);
  }
}

/**
 * Task Dialog öffnen
 */
function openTaskDialog(task) {

  let dialog = document.getElementById("taskDialog");

  let priorityIcon = getPriorityIcon(task.priority);

  let assignedHTML = (task.assignedTo || [])
    .map(name => `
      <div class="assigned-user">
        <span class="avatar">
          ${getInitials(name)}
        </span>
        ${name}
      </div>
    `)
    .join("");

  let subtasksHTML = (task.subtasks || [])
    .map(st => `
      <div>
        <input class="subtaskCheckbox"
               type="checkbox"
               ${st.completed ? "checked" : ""}>
        <span>${st.title}</span>
      </div>
    `)
    .join("");

  dialog.innerHTML = `

    <div class="taskDialogContent">

      <div class="dialogHeader">

        <div class="category catFontSize ${task.category.replace(' ', '')}">
          ${task.category}
        </div>

        <button class="close-btn"
                onclick="closeTaskDialog()">

          <img src="../assets/img/close.svg">

        </button>

      </div>

      <h2>${task.title}</h2>

      <p class="subtitleDialogue">
        ${task.description}
      </p>

      <p class="descriptionDialogue">
        Due date:
        <span class="date">${task.dueDate}</span>
      </p>

      <p class="descriptionDialogue">
        Priority:
        <span class="priority">
          ${priorityStatus(task.priority)}
        </span>

        <img src="${priorityIcon}"
             style="width:16px;">
      </p>

      <div class="assigned-to descriptionDialogue">

        <p class="margin">
          Assigned To:
        </p>

        ${assignedHTML}

      </div>

      ${task.subtasks && task.subtasks.length > 0 ? `

      <div class="subtasks descriptionDialogue">

        <p class="margin">
          Subtasks:
        </p>

        ${subtasksHTML}

      </div>

      ` : ""}
     <div class="dialogFooterPosition">
      <div class="dialogFooter"> 
        <div class="dialogFooterDelete" onclick="deleteTask('${task.id}')"></div>
        <div class="footerLine"> </div> 
        <div class="dialogFooterEdit"> </div>
      </div> 
     </div>
  </div>
  `;

  document
    .getElementById("taskDialogOverlay")
    .classList.add("open");

  dialog.classList.add("open");

  document.body.classList.add("dialog-open");
}

/**
 * Dialog schließen
 */
function closeTaskDialog() {

  document
    .getElementById("taskDialog")
    .classList.remove("open");

  document
    .getElementById("taskDialogOverlay")
    .classList.remove("open");

  document.body.classList.remove("dialog-open");
}

/**
 * Task löschen
 */
async function deleteTask(taskId) {

  if (!confirm("Are you sure you want to delete this task? This cannot be undone.")) {
    return;
  }

  try {

    const deleteUrl = `${TASKS_DB_URL.replace('.json', '')}/${taskId}.json`;

    const response = await fetch(deleteUrl, {

      method: "DELETE",

      headers: {
        "Content-Type": "application/json"
      }

    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log("Task deleted successfully");

    closeTaskDialog();

    await loadTasksFromFirebase();

    renderBoard();

  } catch (error) {

    console.error("Error deleting task:", error);

    alert("Task could not be deleted. Please try again.");

  }

}

/**
 * Initialen
 */
function getInitials(name) {

  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Task erstellen
 */
async function createTask() {

  let title =
    document.getElementById("title").value;

  let description =
    document.getElementById("des").value;

  let dueDate =
    document.getElementById("date").value;

  let assignedTo =
    document.getElementById("assignedTo").value;

  let category =
    document.getElementById("category").value;

  let subtask =
    document.getElementById("subtask").value;

  if (!title || !dueDate) {

    alert("Please fill all required fields");

    return;
  }

  let newTask = {

    title: title,

    description: description,

    dueDate: dueDate,

    status: "todo",

    priority: selectedPriority,

    assignedTo: assignedTo
      ? [assignedTo]
      : [],

    category: category || "General",

    subtasks: subtask
      ? [{
        id: 1,
        title: subtask,
        completed: false
      }]
      : []
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

    console.log("Task successfully saved!");

    await loadTasksFromFirebase();

    renderBoard();

    closeAddTask();

  } catch (error) {

    console.error("Error creating task:", error);

    alert("Task could not be saved.");
  }
}

/**
 * Add Task öffnen
 */
function openAddTask() {

  document
    .getElementById("addTaskPanel")
    .classList.add("open");

  document
    .getElementById("addTaskOverlay")
    .classList.add("open");

  document.body.classList.add("dialog-open");

  if (!priorityInitialized) {

    initPriorityButtons();

    priorityInitialized = true;
  }
}

/**
 * Add Task schließen
 */
function closeAddTask() {

  document
    .getElementById("addTaskPanel")
    .classList.remove("open");

  document
    .getElementById("addTaskOverlay")
    .classList.remove("open");

  document.body.classList.remove("dialog-open");
}

/**
 * Priority Buttons
 */
function setButtonIcon(button, white = false) {

  const type = button.classList[1];

  const icons = {
    high: white ? "PrioUrgentWhite.svg" : "urgent.png",
    medium: white ? "PrioMediumWhite.svg" : "medium.png",
    low: white ? "PrioLowWhite.svg" : "low.png"
  };

  button.querySelector("img").src =
    `./assets/img/${icons[type]}`;
} 

function initPriorityButtons() {

  const buttons = document.querySelectorAll(".priorityButton");

  buttons.forEach(button => button.addEventListener("click", () => {

    const active = button.classList.contains("active");

    buttons.forEach(btn => {
      btn.classList.remove("active");
      setButtonIcon(btn);
    });

    if (!active) {
      button.classList.add("active");
      setButtonIcon(button, true);
    }

  }));
}
/**
 * No Task Messages
 */
function updateNoTaskMessages() {

  toggleNoTask("todo", "noTaskTodo");

  toggleNoTask("inProgress", "noTaskInProgress");

  toggleNoTask(
    "awaitingFeedback",
    "noTaskAwaitingFeedback"
  );

  toggleNoTask("done", "noTaskDone");
}

function toggleNoTask(columnId, messageId) {

  let column =
    document.getElementById(columnId);

  let message =
    document.getElementById(messageId);

  if (column.children.length === 0) {
    message.style.display = "flex";
  }

  else {
    message.style.display = "none";
  }
}