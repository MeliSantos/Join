let tasks = [
    {
        id: 2,
        title: "CSS Architecture Planning",
        description: "Define SCSS naming conventions",
        dueDate: "2023-10-23",
        status: "inProgress",
        priority: "urgent",
        assignedTo: ["Sofia Müller"],
        category: "Design",
        subtasks: [
            { id: 1, title: "Research BEM vs SMACSS", completed: false },
            { id: 2, title: "Draft naming guidelines", completed: false }
        ]
    },
    {
        id: 3,
        title: "Test Task 2",
        description: "Noch eine Aufgabe",
        dueDate: "2023-10-25",
        status: "todo",
        priority: "low",
        assignedTo: ["Max Mustermann"],
        category: "Development",
        subtasks: []
    }
];

function init() {
    renderBoard();
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
}

function getSubtaskProgress(subtasks) {
    if (!subtasks || subtasks.length === 0) return "0/0";

    let done = subtasks.filter(st => st.completed).length;
    return `${done}/${subtasks.length}`;
}

function createTaskCard(task) {
    let card = document.createElement("div");
    card.classList.add("task-card");

    let progress = getSubtaskProgress(task.subtasks);
    let assignedHTML = task.assignedTo.map(name => `<span class="avatar">${getInitials(name)}</span>`).join("");

    card.innerHTML = `
    <span class="category">${task.category}</span>
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <div class="subtasks">
      ${progress} Subtasks
    </div>
    <div class="assigned-to">
    ${assignedHTML}
    </div>
    <div class="priority">${task.priority}</div>
  `;
    card.onclick = () => openTaskDialog(task);
    return card;
}

function openTaskDialog(task) {
    alert(task.title); // erstmal zum testen
}

function getInitials(name) {
    return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase();
}

function createTask() {
    let title = document.getElementById("title").value;
    let description = document.getElementById("description").value;

    let newTask = {
        id: Date.now(),
        title,
        description,
        dueDate: "2023-10-30",
        status: "todo",
        priority: "medium",
        assignedTo: ["Guest"],
        category: "General",
        subtasks: []
    };

    tasks.push(newTask);
    renderBoard();
}