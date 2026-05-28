const TASKS_DB_URL = "https://join-45b16-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

let tasks = [];
let currentUser = null;

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
      return;
    }

    // Convert Firebase object to array
    tasks = Object.entries(data).map(([key, task]) => ({
      id: key,
      ...task
    }));

    console.log("Loaded tasks from Firebase:", tasks);
  } catch (error) {
    console.error("Error loading tasks from Firebase:", error);
    tasks = [];
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

/**
 * Calculate summary statistics
 */
function calculateStatistics() {
  const filteredTasks = getFilteredTasks();
  
  const stats = {
    todo: filteredTasks.filter(t => t.status === "todo").length,
    done: filteredTasks.filter(t => t.status === "done").length,
    inProgress: filteredTasks.filter(t => t.status === "inProgress").length,
    awaitingFeedback: filteredTasks.filter(t => t.status === "awaitingFeedback").length,
    urgent: filteredTasks.filter(t => t.priority === "urgent").length,
    totalTasks: filteredTasks.length,
    upcomingDeadline: getUpcomingDeadline(filteredTasks)
  };
  
  return stats;
}

/**
 * Get the next upcoming deadline
 */
function getUpcomingDeadline(filteredTasks) {
  if (filteredTasks.length === 0) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureTasks = filteredTasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate >= today;
  });
  
  if (futureTasks.length === 0) return null;
  
  futureTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  return formatDate(futureTasks[0].dueDate);
}

/**
 * Format date to readable format
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Update summary display with statistics
 */
function updateSummaryDisplay() {
  const stats = calculateStatistics();
  
  // Update To-Do count
  const todoElement = document.querySelector(".firstSectionSummary .summaryFirstCard:nth-child(1) .tasksNumber");
  if (todoElement) todoElement.textContent = stats.todo;
  
  // Update Done count
  const doneElement = document.querySelector(".firstSectionSummary .summaryFirstCard:nth-child(2) .tasksNumber");
  if (doneElement) doneElement.textContent = stats.done;
  
  // Update Urgent count
  const urgentElement = document.querySelector(".secondSectionSummary .secondCardLeft .tasksNumber");
  if (urgentElement) urgentElement.textContent = stats.urgent;
  
  // Update Upcoming Deadline
  const deadlineElement = document.querySelector(".deadlineContent .currentDate");
  if (deadlineElement) {
    deadlineElement.textContent = stats.upcomingDeadline || "No upcoming deadline";
  }
  
  // Update Tasks in Board count
  const boardElement = document.querySelector(".thirdSectionSummary .summaryThirdCard:nth-child(1) .tasksNumber");
  if (boardElement) boardElement.textContent = stats.totalTasks;
  
  // Update Tasks in Progress count
  const inProgressElement = document.querySelector(".thirdSectionSummary .summaryThirdCard:nth-child(2) .tasksNumber");
  if (inProgressElement) inProgressElement.textContent = stats.inProgress;
  
  // Update Awaiting Feedback count
  const awaitingElement = document.querySelector(".thirdSectionSummary .summaryThirdCard:nth-child(3) .tasksNumber");
  if (awaitingElement) awaitingElement.textContent = stats.awaitingFeedback;
}

/**
 * Display current user name on Summary page
 */
function displayUserName() {
    const currentUserJSON = localStorage.getItem("currentUser");
    if (!currentUserJSON) return;

    currentUser = JSON.parse(currentUserJSON);
    
    if (currentUser && currentUser.name) {
        const nameElement = document.querySelector(".name");
        if (nameElement) {
            nameElement.textContent = currentUser.name;
        }
    }
}

/**
 * Initialize summary page
 */
async function initSummary() {
    displayUserName();
    await loadTasksFromFirebase();
    updateSummaryDisplay();
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initSummary);
