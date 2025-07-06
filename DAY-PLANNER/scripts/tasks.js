class TaskManager {
  constructor() {
    console.log("TaskManager constructor called");
    this.tasks = JSON.parse(localStorage.getItem("dayPlannerTasks")) || [];
    console.log("TaskManager initialized with", this.tasks.length, "tasks");
  }

  addTask(taskData) {
    console.log("Adding task:", taskData);
    const newTask = {
      id: this.generateId(),
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending",
    };

    this.tasks.push(newTask);
    this.saveTasks();
    console.log("Task added successfully:", newTask);
    return newTask;
  }

  updateTask(idOrTask, updates) {
    console.log("Updating task:", idOrTask, updates);
    let taskId, taskUpdates;

    // Handle both formats: updateTask(taskObject) or updateTask(id, updates)
    if (typeof idOrTask === "object") {
      // Called with task object
      const taskData = idOrTask;
      taskId = taskData.id;
      taskUpdates = taskData;
    } else {
      // Called with id and updates
      taskId = idOrTask;
      taskUpdates = updates;
    }

    const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      console.error("Task not found for update:", taskId);
      return null;
    }

    const updatedTask = {
      ...this.tasks[taskIndex],
      ...taskUpdates,
      updatedAt: new Date().toISOString(),
    };

    this.tasks[taskIndex] = updatedTask;
    this.saveTasks();
    console.log("Task updated successfully:", updatedTask);
    return updatedTask;
  }

  deleteTask(id) {
    console.log("Deleting task:", id);
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.saveTasks();
    console.log("Task deleted successfully");
  }

  getTasksForDate(date) {
    const tasks = this.tasks.filter((task) => task.date === date);
    console.log(`Getting tasks for date ${date}:`, tasks.length, "tasks");
    return tasks;
  }

  getAllTasks() {
    console.log("Getting all tasks:", this.tasks.length);
    return this.tasks;
  }

  getTasksByStatus(status) {
    return this.tasks.filter((task) => task.status === status);
  }

  getOverdueTasks() {
    const now = new Date();
    return this.tasks.filter((task) => {
      const taskDate = new Date(`${task.date}T${task.endTime}`);
      return task.status !== "completed" && taskDate < now;
    });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  saveTasks() {
    console.log("Saving tasks to localStorage:", this.tasks.length, "tasks");
    localStorage.setItem("dayPlannerTasks", JSON.stringify(this.tasks));
  }

  loadTasks() {
    console.log("Loading tasks from localStorage");
    this.tasks = JSON.parse(localStorage.getItem("dayPlannerTasks")) || [];
    console.log("Loaded", this.tasks.length, "tasks");
  }
}

// Task rendering functions
function renderTasksForDate(date) {
  const tasks = taskManager.getTasksForDate(date);

  // Try to find time slots container for day view
  let timeSlots = document.querySelectorAll(".time-slot");

  // If no time slots found, try to find week view containers
  if (timeSlots.length === 0) {
    const weekTimeSlots = document.getElementById(`time-slots-${date}`);
    if (weekTimeSlots) {
      timeSlots = weekTimeSlots.querySelectorAll(".time-slot");
    }
  }

  // If still no time slots, try month view
  if (timeSlots.length === 0) {
    const monthDayTasks = document.querySelector(`[data-date="${date}"]`);
    if (monthDayTasks) {
      // For month view, just show task count or brief info
      const taskCount = tasks.length;
      monthDayTasks.innerHTML =
        taskCount > 0 ? `${taskCount} task${taskCount !== 1 ? "s" : ""}` : "";
      return;
    }
  }

  // Clear existing tasks
  timeSlots.forEach((slot) => {
    const taskArea = slot.querySelector(".task-area");
    if (taskArea) {
      taskArea.innerHTML = "";
    }
  });

  // Render each task
  tasks.forEach((task) => {
    const startHour = parseInt(task.startTime.split(":")[0]);
    const startMinute = parseInt(task.startTime.split(":")[1]);
    const endHour = parseInt(task.endTime.split(":")[0]);
    const endMinute = parseInt(task.endTime.split(":")[1]);

    // Calculate task duration and position
    const taskDuration = (endHour - startHour) * 60 + (endMinute - startMinute);
    const startPosition = startMinute / 60; // Position within the hour (0-1)

    // Find the time slot for the start hour - try multiple selectors
    let timeSlot = document.querySelector(
      `.time-slot[data-hour="${startHour}"]`
    );

    // If not found, try with data-time attribute
    if (!timeSlot) {
      const timeString = `${startHour.toString().padStart(2, "0")}:00`;
      timeSlot = document.querySelector(
        `.time-slot[data-time="${timeString}"]`
      );
    }

    // If still not found, try week view containers
    if (!timeSlot) {
      const weekTimeSlots = document.getElementById(`time-slots-${date}`);
      if (weekTimeSlots) {
        const timeString = `${startHour.toString().padStart(2, "0")}:00`;
        timeSlot = weekTimeSlots.querySelector(
          `.time-slot[data-time="${timeString}"]`
        );
      }
    }

    if (timeSlot) {
      const taskElement = createTaskElement(task, taskDuration, startPosition);
      const taskArea = timeSlot.querySelector(".task-area");
      if (taskArea) {
        taskArea.appendChild(taskElement);
      }
    } else {
      console.warn(`Time slot not found for hour ${startHour} on date ${date}`);
    }
  });

  // Update time slot colors based on current time
  updateTimeSlotColors();

  // Update task count in header
  updateTaskCount(tasks.length);

  // Update task statistics
  if (typeof showTaskStatistics === "function") {
    showTaskStatistics();
  }
}

function createTaskElement(task, duration, startPosition) {
  const taskElement = document.createElement("div");
  taskElement.className = `task ${task.priority} ${task.status.replace(
    " ",
    "-"
  )}`;
  taskElement.dataset.taskId = task.id;

  // Calculate task height based on duration
  const heightInMinutes = Math.max(duration, 30); // Minimum 30 minutes
  const heightPercentage = (heightInMinutes / 60) * 100;

  // Apply positioning and sizing
  taskElement.style.position = "absolute";
  taskElement.style.top = `${startPosition * 100}%`;
  taskElement.style.height = `${heightPercentage}%`;
  taskElement.style.left = "10px";
  taskElement.style.right = "10px";
  taskElement.style.zIndex = "10";

  // Check if task is overdue
  const now = new Date();
  const taskDateTime = new Date(`${task.date}T${task.endTime}`);
  const isOverdue = task.status !== "completed" && taskDateTime < now;

  if (isOverdue) {
    taskElement.classList.add("overdue");
  }

  const taskHeader = document.createElement("div");
  taskHeader.className = "task-header";

  const taskTitle = document.createElement("div");
  taskTitle.className = "task-title";
  taskTitle.textContent = task.title;

  const taskPriority = document.createElement("div");
  taskPriority.className = `priority-badge ${task.priority}`;
  taskPriority.textContent =
    task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  taskHeader.appendChild(taskTitle);
  taskHeader.appendChild(taskPriority);

  const taskTime = document.createElement("div");
  taskTime.className = "task-time";
  taskTime.textContent = `${task.startTime} - ${task.endTime}`;

  // Show description if enabled in settings
  const showDescriptions =
    localStorage.getItem("dayPlannerShowDescriptions") !== "false";
  if (task.description && showDescriptions) {
    const taskDesc = document.createElement("div");
    taskDesc.className = "task-description";
    taskDesc.textContent = task.description;
    taskElement.appendChild(taskDesc);
  }

  const taskActions = document.createElement("div");
  taskActions.className = "task-actions";

  const completeBtn = document.createElement("button");
  completeBtn.className = "btn-icon complete";
  completeBtn.innerHTML = '<i class="fas fa-check"></i>';
  completeBtn.title =
    task.status === "completed" ? "Mark as pending" : "Mark as completed";
  completeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const newStatus = task.status === "completed" ? "pending" : "completed";
    taskManager.updateTask(task.id, { status: newStatus });
    renderTasksForDate(task.date);
    calendar.render();
    showToast(
      `Task ${newStatus === "completed" ? "completed" : "marked as pending"}!`,
      "success"
    );
  });

  const editBtn = document.createElement("button");
  editBtn.className = "btn-icon edit";
  editBtn.innerHTML = '<i class="fas fa-edit"></i>';
  editBtn.title = "Edit task";
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openTaskModal(task.id);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn-icon delete";
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.title = "Delete task";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      taskManager.deleteTask(task.id);
      renderTasksForDate(task.date);
      calendar.render();
      showToast("Task deleted!", "success");
    }
  });

  taskActions.appendChild(completeBtn);
  taskActions.appendChild(editBtn);
  taskActions.appendChild(deleteBtn);

  taskElement.appendChild(taskHeader);
  taskElement.appendChild(taskTime);
  taskElement.appendChild(taskActions);

  // Add click event to view task details
  taskElement.addEventListener("click", () => {
    openTaskModal(task.id);
  });

  return taskElement;
}

function updateTimeSlotColors() {
  const timeSlots = document.querySelectorAll(".time-slot");
  const now = new Date();
  const currentHour = now.getHours();

  timeSlots.forEach((slot) => {
    const hour = parseInt(slot.dataset.hour);

    // Reset classes
    slot.classList.remove("past", "present", "future");

    if (hour < currentHour) {
      slot.classList.add("past");
    } else if (hour === currentHour) {
      slot.classList.add("present");
    } else {
      slot.classList.add("future");
    }
  });
}

function updateTaskCount(count) {
  // Update task count in the header if there's a counter element
  const taskCounter = document.querySelector(".task-counter");
  if (taskCounter) {
    taskCounter.textContent = `${count} task${count !== 1 ? "s" : ""}`;
  }
}

function setupSearchAndFilter() {
  const searchInput = document.querySelector(".search-box input");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleSearch, 300));
  }

  // Add filter buttons
  const filterContainer = document.createElement("div");
  filterContainer.className = "task-filters";
  filterContainer.innerHTML = `
        <button class="btn filter active" data-filter="all">All</button>
        <button class="btn filter" data-filter="high">High Priority</button>
        <button class="btn filter" data-filter="completed">Completed</button>
        <button class="btn filter" data-filter="overdue">Overdue</button>
    `;

  const headerActions = document.querySelector(".header-actions");
  if (headerActions) {
    headerActions.appendChild(filterContainer);
  }

  // Add filter click events
  document.querySelectorAll(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilters(btn.dataset.filter, searchInput ? searchInput.value : "");
    });
  });
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const activeFilter = document.querySelector(".filter.active");
  const filterType = activeFilter ? activeFilter.dataset.filter : "all";
  applyFilters(filterType, searchTerm);
}

function applyFilters(filter, searchTerm = "") {
  const tasks = document.querySelectorAll(".task");

  tasks.forEach((task) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "high" && task.classList.contains("high")) ||
      (filter === "completed" && task.classList.contains("completed")) ||
      (filter === "overdue" && task.classList.contains("overdue"));

    const matchesSearch = task.textContent.toLowerCase().includes(searchTerm);

    if (matchesFilter && matchesSearch) {
      task.style.display = "block";
    } else {
      task.style.display = "none";
    }
  });
}

// Utility debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Load tasks function
function loadTasks() {
  // Load tasks for the current view
  const today = new Date().toISOString().split("T")[0];
  renderTasksForDate(today);

  // Set up search and filter
  if (typeof setupSearchAndFilter === "function") {
    setupSearchAndFilter();
  }

  // Show task statistics
  if (typeof showTaskStatistics === "function") {
    showTaskStatistics();
  }
}

// Make functions globally available
window.loadTasks = loadTasks;
window.renderTasksForDate = renderTasksForDate;
window.updateCurrentDateDisplay = updateCurrentDateDisplay;
