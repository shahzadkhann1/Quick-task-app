
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const totalTasks = document.getElementById("totalTasks");
const activeTasks = document.getElementById("activeTasks");
const completedTasks = document.getElementById("completedTasks");
const allCount = document.getElementById("allCount");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const progressBar = document.getElementById("progressBar");

const visibleCount = document.getElementById("visibleCount");
const footerText = document.getElementById("footerText");
const clearCompleted = document.getElementById("clearCompleted");

const emptyTitle = document.getElementById("emptyTitle");
const emptyMessage = document.getElementById("emptyMessage");

let currentFilter = "all";
let tasks = [];

try {
    const savedTasks = localStorage.getItem("quickTaskTasks");
    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

    if (Array.isArray(parsedTasks)) {
        tasks = parsedTasks.filter(task =>
            task &&
            Number.isSafeInteger(task.id) &&
            typeof task.title === "string" &&
            typeof task.completed === "boolean"
        );
    }
} catch (error) {
    console.error("Could not load saved tasks:", error);
}

document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

function saveTasks() {
    try {
        localStorage.setItem("quickTaskTasks", JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save tasks:", error);
        alert("Your browser could not save the tasks. Check your browser storage settings.");
    }
}

function getVisibleTasks() {
    if (currentFilter === "active") {
        return tasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {
        return tasks.filter(task => task.completed);
    }

    return tasks;
}

function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;

    const progress = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalTasks.textContent = total;
    activeTasks.textContent = active;
    completedTasks.textContent = completed;
    allCount.textContent = total;

    progressText.textContent = `${progress}%`;
    progressFill.style.width = `${progress}%`;
    progressBar.setAttribute("aria-valuenow", progress);

    visibleCount.textContent =
        `${getVisibleTasks().length} ${getVisibleTasks().length === 1 ? "task" : "tasks"}`;

    if (total === 0) {
        footerText.textContent = "Ready when you are.";
    } else if (active === 0) {
        footerText.textContent = "Amazing! All tasks completed.";
    } else {
        footerText.textContent = `${active} task${active === 1 ? "" : "s"} left to go.`;
    }
}

function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = getVisibleTasks();

    emptyState.classList.toggle("visible", visibleTasks.length === 0);

    if (visibleTasks.length === 0) {
        if (currentFilter === "active" && tasks.length > 0) {
            emptyTitle.textContent = "All caught up!";
            emptyMessage.textContent = "You have no active tasks right now.";
        } else if (currentFilter === "completed") {
            emptyTitle.textContent = "Nothing completed yet";
            emptyMessage.textContent = "Complete a task and it will appear here.";
        } else {
            emptyTitle.textContent = "Your workspace is clear!";
            emptyMessage.textContent = "Add your first task above and start making progress.";
        }
    }

    visibleTasks.forEach(task => {
        const item = document.createElement("article");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("is-completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.title} as ${task.completed ? "active" : "completed"}`
        );

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;

        const status = document.createElement("span");
        status.className = task.completed
            ? "task-status status-completed"
            : "task-status status-active";
        status.textContent = task.completed ? "Completed" : "In progress";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        item.append(checkbox, title, status, deleteButton);
        taskList.appendChild(item);
    });

    updateStatistics();
}

function addTask(title) {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
        taskInput.focus();
        return;
    }

    if (trimmedTitle.length > 150) {
        alert("Please keep your task under 150 characters.");
        return;
    }

    tasks.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        title: trimmedTitle,
        completed: false
    });

    currentFilter = "all";
    updateActiveNavigation();
    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
}

function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, completed: !task.completed }
            : task
    );

    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function updateActiveNavigation() {
    document.querySelectorAll(".nav-item").forEach(button => {
        const isActive = button.dataset.filter === currentFilter;
        button.classList.toggle("active", isActive);

        if (isActive) {
            button.setAttribute("aria-current", "page");
        } else {
            button.removeAttribute("aria-current");
        }
    });
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();
    addTask(taskInput.value);
});

document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        updateActiveNavigation();
        renderTasks();
    });
});

clearCompleted.addEventListener("click", () => {
    const hasCompletedTasks = tasks.some(task => task.completed);

    if (!hasCompletedTasks) {
        return;
    }

    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

renderTasks();
