// Day Planner Main Application
console.log("Day Planner app.js loaded");

// Global variables
let taskManager;
let calendar;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing...");
  initApp();
});

function initApp() {
  console.log("Initializing app...");

  // Initialize components
  taskManager = new TaskManager();
  calendar = new Calendar();

  // Set up event listeners
  setupEventListeners();

  // Set up mobile navigation
  setupMobileNavigation();

  // Load initial data
  loadInitialData();

  // Show today's view
  showTodayView();

  console.log("App initialization complete");

  // Make functions globally available
  window.handleTaskSubmit = handleTaskSubmit;
  window.handleCloseModal = handleCloseModal;
  window.handleModalOutsideClick = handleModalOutsideClick;
  window.openTaskModal = openTaskModal;
  window.closeModal = closeModal;
  window.handleAddTaskClick = handleAddTaskClick;
  window.showToast = showToast;
  window.taskManager = taskManager;
  window.calendar = calendar;
  window.renderTasksForDate = renderTasksForDate;

  console.log("Global functions made available");
}

function setupMobileNavigation() {
  const mobileToggle = document.getElementById("mobile-nav-toggle");
  const sidebar = document.querySelector(".sidebar");

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      console.log("Mobile navigation toggled");
    });

    // Close sidebar when clicking outside
    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
        sidebar.classList.remove("active");
      }
    });

    // Close sidebar when clicking on a navigation link
    const navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 1024) {
          sidebar.classList.remove("active");
        }
      });
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1024) {
        sidebar.classList.remove("active");
      }
    });
  }
}

function setupEventListeners() {
  console.log("Setting up event listeners...");

  // Add task button - try multiple selectors
  let addTaskBtn = document.getElementById("add-task-btn");
  if (!addTaskBtn) {
    addTaskBtn = document.querySelector(".add-task");
  }
  if (!addTaskBtn) {
    addTaskBtn = document.querySelector("button[class*='add-task']");
  }

  console.log("Add task button found:", addTaskBtn);
  if (addTaskBtn) {
    // Remove any existing listeners
    addTaskBtn.removeEventListener("click", handleAddTaskClick);
    addTaskBtn.addEventListener("click", handleAddTaskClick);
    console.log("Add task event listener attached");
  } else {
    console.error("Add task button not found!");
  }

  // Modal close buttons
  const closeModalBtn = document.getElementById("close-modal");
  const cancelBtn = document.getElementById("cancel-btn");

  console.log("Close modal button found:", closeModalBtn);
  console.log("Cancel button found:", cancelBtn);

  if (closeModalBtn) {
    closeModalBtn.removeEventListener("click", handleCloseModal);
    closeModalBtn.addEventListener("click", handleCloseModal);
    console.log("Close modal event listener attached");
  } else {
    console.error("Close modal button not found!");
  }

  if (cancelBtn) {
    cancelBtn.removeEventListener("click", handleCloseModal);
    cancelBtn.addEventListener("click", handleCloseModal);
    console.log("Cancel button event listener attached");
  } else {
    console.error("Cancel button not found!");
  }

  // Task form submission
  const taskForm = document.getElementById("task-form");
  console.log("Task form found:", taskForm);
  if (taskForm) {
    // Remove all existing listeners
    taskForm.removeEventListener("submit", handleTaskSubmit);

    // Add new listener
    taskForm.addEventListener("submit", handleTaskSubmit);
    console.log("Task form submit listener attached");

    // Also add listener to the save button as backup
    const saveBtn = document.getElementById("save-btn");
    if (saveBtn) {
      saveBtn.removeEventListener("click", handleTaskSubmit);
      saveBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Save button clicked");
        handleTaskSubmit(e);
      });
      console.log("Save button click listener attached");
    }
  } else {
    console.error("Task form not found!");
  }

  // Calendar navigation
  const prevBtn = document.getElementById("calendar-prev");
  const nextBtn = document.getElementById("calendar-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      console.log("Calendar prev clicked");
      calendar.prevMonth();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      console.log("Calendar next clicked");
      calendar.nextMonth();
    });
  }

  // Click outside modal to close
  const modal = document.getElementById("task-modal");
  if (modal) {
    modal.removeEventListener("click", handleModalOutsideClick);
    modal.addEventListener("click", handleModalOutsideClick);
    console.log("Modal outside click listener attached");
  }

  // Sidebar navigation
  setupSidebarNavigation();

  // Search functionality
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.removeEventListener("input", handleSearch);
    searchInput.addEventListener("input", handleSearch);
  }

  // Priority filter functionality
  const priorityFilter = document.getElementById("priority-filter");
  if (priorityFilter) {
    priorityFilter.removeEventListener("change", handlePriorityFilter);
    priorityFilter.addEventListener("change", handlePriorityFilter);
  }

  // Keyboard shortcuts
  document.removeEventListener("keydown", handleKeyboardShortcuts);
  document.addEventListener("keydown", handleKeyboardShortcuts);

  // Time slot clicks
  document.addEventListener("click", (e) => {
    if (e.target.closest(".time-slot")) {
      const timeSlot = e.target.closest(".time-slot");
      const time = timeSlot.dataset.time;
      const date = timeSlot.dataset.date;
      if (time && date) {
        openTaskModal(null, time, date);
      }
    }
  });

  // Handle touch events for mobile
  setupTouchEvents();

  console.log("Event listeners setup complete");
}

function setupTouchEvents() {
  // Add touch support for mobile devices
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  document.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      const sidebar = document.querySelector(".sidebar");
      const mobileToggle = document.getElementById("mobile-nav-toggle");

      if (diff > 0) {
        // Swipe left - close sidebar
        if (sidebar && sidebar.classList.contains("active")) {
          sidebar.classList.remove("active");
        }
      } else {
        // Swipe right - open sidebar
        if (
          sidebar &&
          !sidebar.classList.contains("active") &&
          window.innerWidth <= 1024
        ) {
          sidebar.classList.add("active");
        }
      }
    }
  }
}

function setupSidebarNavigation() {
  const navLinks = document.querySelectorAll(".nav-links li a");
  console.log("Found navigation links:", navLinks.length);

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach(function (l) {
        l.parentElement.classList.remove("active");
      });

      // Add active class to clicked link
      link.parentElement.classList.add("active");

      // Handle navigation
      const view = link.getAttribute("data-view");
      console.log("Navigation clicked:", view);
      handleNavigation(view);
    });
  });
}

function handleNavigation(view) {
  console.log("Navigation to:", view);
  switch (view) {
    case "today":
      window.location.href = "index.html";
      break;
    case "week":
      window.location.href = "week.html";
      break;
    case "month":
      window.location.href = "month.html";
      break;
    case "settings":
      window.location.href = "settings.html";
      break;
  }
}

function showTodayView() {
  const today = new Date().toISOString().split("T")[0];
  updateCurrentDateDisplay(today);

  // Load and render tasks for today
  if (taskManager) {
    taskManager.loadTasks();
    renderTasksForDate(today);
  }

  const dateDisplay = document.querySelector(".date-display h1");
  if (dateDisplay) {
    dateDisplay.textContent = "Today";
  }
}

function showWeekView() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const dateDisplay = document.querySelector(".date-display h1");
  const currentDate = document.getElementById("current-date");

  if (dateDisplay) dateDisplay.textContent = "This Week";
  if (currentDate) {
    currentDate.textContent =
      "Week of " +
      startOfWeek.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
  }

  // For now, show today's view
  showTodayView();
}

function showMonthView() {
  const today = new Date();
  const dateDisplay = document.querySelector(".date-display h1");
  const currentDate = document.getElementById("current-date");

  if (dateDisplay) dateDisplay.textContent = "This Month";
  if (currentDate) {
    currentDate.textContent = today.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  // For now, show today's view
  showTodayView();
}

function openTaskModal(taskId, prefillTime = null, prefillDate = null) {
  const modal = document.getElementById("task-modal");
  const modalTitle = document.getElementById("modal-title");
  const taskIdInput = document.getElementById("task-id");
  const taskTitle = document.getElementById("task-title");
  const taskDescription = document.getElementById("task-description");
  const taskDate = document.getElementById("task-date");
  const taskStartTime = document.getElementById("task-start-time");
  const taskEndTime = document.getElementById("task-end-time");
  const taskPriority = document.getElementById("task-priority");
  const taskCategory = document.getElementById("task-category");
  const taskDuration =
    localStorage.getItem("dayPlannerDefaultDuration") || "60";

  if (modal) {
    // Check if we're editing an existing task
    let existingTask = null;
    if (taskId && taskManager) {
      existingTask = taskManager.tasks.find((task) => task.id === taskId);
      console.log("Editing existing task:", existingTask);
    }

    if (existingTask) {
      // Fill form with existing task data
      taskIdInput.value = existingTask.id;
      taskTitle.value = existingTask.title;
      taskDescription.value = existingTask.description || "";
      taskDate.value = existingTask.date;
      taskStartTime.value = existingTask.startTime;
      taskEndTime.value = existingTask.endTime;
      taskPriority.value = existingTask.priority;
      taskCategory.value = existingTask.category;
      modalTitle.textContent = "Edit Task";
    } else {
      // Reset form for new task
      taskIdInput.value = "";
      taskTitle.value = "";
      taskDescription.value = "";
      taskCategory.value = "work"; // Reset to default category

      // Set date - use prefillDate if provided, otherwise today
      const today = new Date().toISOString().split("T")[0];
      taskDate.value = prefillDate || today;

      // Set time based on prefill or current time
      if (prefillTime) {
        taskStartTime.value = prefillTime;
        const startTime = new Date(`2000-01-01T${prefillTime}`);
        const endTime = new Date(
          startTime.getTime() + parseInt(taskDuration) * 60000
        );
        taskEndTime.value = endTime.toTimeString().slice(0, 5);
      } else {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        taskStartTime.value = currentTime;

        const startTime = new Date(`2000-01-01T${currentTime}`);
        const endTime = new Date(
          startTime.getTime() + parseInt(taskDuration) * 60000
        );
        taskEndTime.value = endTime.toTimeString().slice(0, 5);
      }

      // Set default priority
      const defaultPriority =
        localStorage.getItem("dayPlannerDefaultPriority") || "medium";
      taskPriority.value = defaultPriority;
      modalTitle.textContent = "Add New Task";
    }

    // Show modal
    modal.classList.add("active");
    document.body.classList.add("modal-open");

    // Focus on title input
    setTimeout(() => {
      taskTitle.focus();
    }, 100);

    console.log(
      "Modal opened with date:",
      taskDate.value,
      "start time:",
      taskStartTime.value,
      "taskId:",
      taskId
    );
  }
}

function closeModal() {
  console.log("closeModal function called");

  const modal = document.getElementById("task-modal");
  if (modal) {
    console.log("Modal found, removing active class");

    // Method 1: Remove active class
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");

    // Method 2: Force display none as backup
    modal.style.display = "none";

    // Method 3: Reset display after a short delay
    setTimeout(() => {
      modal.style.display = "";
      console.log("Modal display reset");
    }, 300);

    // Reset form
    const form = document.getElementById("task-form");
    if (form) {
      form.reset();
      console.log("Form reset");
    }

    // Clear any error states
    const inputs = modal.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.classList.remove("error");
    });

    // Remove focus from any focused element
    if (document.activeElement) {
      document.activeElement.blur();
    }

    console.log("Modal should now be closed");
  } else {
    console.error("Modal element not found!");
  }
}

function handleTaskSubmit(e) {
  e.preventDefault();
  console.log("Task form submitted");

  try {
    // Get all form elements directly
    const taskId = document.getElementById("task-id").value;
    const taskTitle = document.getElementById("task-title").value;
    const taskDescription = document.getElementById("task-description").value;
    const taskDate = document.getElementById("task-date").value;
    const taskStartTime = document.getElementById("task-start-time").value;
    const taskEndTime = document.getElementById("task-end-time").value;
    const taskPriority = document.getElementById("task-priority").value;
    const taskCategory = document.getElementById("task-category").value;

    console.log("Form data collected:", {
      taskId,
      taskTitle,
      taskDescription,
      taskDate,
      taskStartTime,
      taskEndTime,
      taskPriority,
      taskCategory,
    });

    // Validate required fields
    if (!taskTitle || !taskDate || !taskStartTime || !taskEndTime) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    // Validate time logic
    if (taskStartTime >= taskEndTime) {
      showToast("End time must be after start time", "error");
      return;
    }

    const taskData = {
      id: taskId || Date.now().toString(),
      title: taskTitle,
      description: taskDescription,
      date: taskDate,
      startTime: taskStartTime,
      endTime: taskEndTime,
      priority: taskPriority,
      category: taskCategory,
      status: "pending",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // If editing an existing task, preserve the original status and creation date
    if (taskId && taskManager) {
      const existingTask = taskManager.tasks.find((task) => task.id === taskId);
      if (existingTask) {
        taskData.status = existingTask.status;
        taskData.completed = existingTask.completed;
        taskData.createdAt = existingTask.createdAt;
        console.log("Preserving existing task status:", existingTask.status);
      }
    }

    console.log("Task data to save:", taskData);

    if (taskManager) {
      const isEdit = taskId && taskId !== "";
      if (isEdit) {
        const updatedTask = taskManager.updateTask(taskData);
        if (updatedTask) {
          showToast("Task updated successfully!", "success");
        } else {
          showToast("Error updating task", "error");
          return;
        }
      } else {
        const newTask = taskManager.addTask(taskData);
        if (newTask) {
          showToast("Task added successfully!", "success");
        } else {
          showToast("Error adding task", "error");
          return;
        }
      }
    } else {
      console.error("TaskManager not available!");
      showToast("Error: TaskManager not available", "error");
      return;
    }

    // Close modal first
    console.log("Closing modal...");
    closeModal();

    // Then reload and render tasks for the specific date
    setTimeout(() => {
      if (taskManager) {
        taskManager.loadTasks();

        // Refresh current view based on the page
        const currentPage = window.location.pathname.split("/").pop();
        console.log("Current page:", currentPage);

        if (currentPage === "month.html" || currentPage.includes("month")) {
          // Refresh month view
          console.log("Refreshing month view...");
          if (typeof refreshMonthView === "function") {
            refreshMonthView();
          } else {
            console.error("refreshMonthView function not found!");
            // Fallback: regenerate month view
            if (typeof generateMonthView === "function") {
              generateMonthView();
            }
          }
        } else if (
          currentPage === "week.html" ||
          currentPage.includes("week")
        ) {
          // Refresh week view
          console.log("Refreshing week view...");
          if (typeof refreshWeekView === "function") {
            refreshWeekView();
          } else if (typeof generateWeekView === "function") {
            generateWeekView();
          }
        } else {
          // Default to today view
          console.log("Rendering tasks for date:", taskDate);
          renderTasksForDate(taskDate);
        }
      }
      updateTaskCounter();
      console.log("Tasks reloaded and rendered for date:", taskDate);
    }, 100);
  } catch (error) {
    console.error("Error submitting task:", error);
    showToast("Error saving task. Please try again.", "error");
  }
}

function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  filterTasks(query);
}

function handlePriorityFilter(event) {
  const priority = event.target.value;
  filterTasksByPriority(priority);
}

function filterTasksByPriority(priority) {
  const tasks = taskManager ? taskManager.getAllTasks() : [];
  const today = new Date().toISOString().split("T")[0];

  let filteredTasks = tasks.filter((task) => task.date === today);

  if (priority !== "all") {
    filteredTasks = filteredTasks.filter((task) => task.priority === priority);
  }

  renderFilteredTasks(filteredTasks);
}

function renderFilteredTasks(tasks) {
  const today = new Date().toISOString().split("T")[0];

  // Clear existing tasks first
  const timeSlots = document.querySelectorAll(".time-slot");
  timeSlots.forEach((slot) => {
    const taskArea = slot.querySelector(".task-area");
    if (taskArea) {
      taskArea.innerHTML = "";
    }
  });

  // Render filtered tasks using the existing system
  if (taskManager) {
    // Temporarily replace the getTasksForDate method to return filtered tasks
    const originalGetTasksForDate = taskManager.getTasksForDate;
    taskManager.getTasksForDate = function (date) {
      if (date === today) {
        return tasks;
      }
      return originalGetTasksForDate.call(this, date);
    };

    // Render tasks
    renderTasksForDate(today);

    // Restore original method
    taskManager.getTasksForDate = originalGetTasksForDate;
  }

  updateTaskCounter(tasks.length);
}

function handleKeyboardShortcuts(e) {
  if (e.key === "Escape") {
    closeModal();
  }
  if (e.key === "n" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    openTaskModal();
  }
}

function loadInitialData() {
  // Load tasks from localStorage
  if (taskManager) {
    taskManager.loadTasks();
  }

  // Reset filters
  resetFilters();
}

function resetFilters() {
  // Reset priority filter
  const priorityFilter = document.getElementById("priority-filter");
  if (priorityFilter) {
    priorityFilter.value = "all";
  }

  // Reset search input
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = "";
  }
}

function showToast(message, type) {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  };

  toast.innerHTML = `
    <i class="toast-icon ${icons[type]}"></i>
    <div class="toast-content">
      <div class="toast-title">${
        type.charAt(0).toUpperCase() + type.slice(1)
      }</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

function handleAddTaskClick(e) {
  e.preventDefault();
  console.log("Add task button clicked");
  openTaskModal();
}

function handleCloseModal(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  console.log("Close modal clicked");
  closeModal();
}

function handleModalOutsideClick(e) {
  if (e.target === e.currentTarget) {
    closeModal();
  }
}

function filterTasks(query) {
  const tasks = taskManager ? taskManager.getAllTasks() : [];
  const today = new Date().toISOString().split("T")[0];

  let filteredTasks = tasks.filter((task) => task.date === today);

  if (query) {
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
    );
  }

  renderFilteredTasks(filteredTasks);
}

function updateTaskCounter(count = null) {
  const taskCounter = document.querySelector(".task-counter");
  if (taskCounter) {
    if (count !== null) {
      taskCounter.textContent = `${count} task${count !== 1 ? "s" : ""}`;
    } else {
      const tasks = taskManager ? taskManager.getAllTasks() : [];
      const today = new Date().toISOString().split("T")[0];
      const todayTasks = tasks.filter((task) => task.date === today);
      taskCounter.textContent = `${todayTasks.length} task${
        todayTasks.length !== 1 ? "s" : ""
      }`;
    }
  }
}

function updateCurrentDateDisplay(date) {
  const currentDateElement = document.getElementById("current-date");
  if (currentDateElement) {
    const dateObj = new Date(date);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    currentDateElement.textContent = dateObj.toLocaleDateString(
      "en-US",
      options
    );
  }
}
