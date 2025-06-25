function setupThemeToggle() {
  const themeToggle = document.createElement("div");
  themeToggle.className = "theme-toggle";
  themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  document.querySelector(".sidebar").appendChild(themeToggle);

  themeToggle.addEventListener("click", toggleTheme);

  // Check for saved theme preference or use preferred color scheme
  const savedTheme = localStorage.getItem("dayPlannerTheme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");

  if (html.getAttribute("data-theme") === "dark") {
    html.removeAttribute("data-theme");
    localStorage.setItem("dayPlannerTheme", "light");
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    html.setAttribute("data-theme", "dark");
    localStorage.setItem("dayPlannerTheme", "dark");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

function setupMobileMenu() {
  const menuToggle = document.createElement("button");
  menuToggle.className = "menu-toggle";
  menuToggle.innerHTML = '<i class="fas fa-bars"></i> Menu';
  document.body.appendChild(menuToggle);

  const calendarToggle = document.createElement("button");
  calendarToggle.className = "calendar-toggle";
  calendarToggle.innerHTML = '<i class="fas fa-calendar"></i> Calendar';
  document.body.appendChild(calendarToggle);

  menuToggle.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("active");
  });

  calendarToggle.addEventListener("click", () => {
    document.querySelector(".calendar-widget").classList.toggle("active");
  });

  // Close menus when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".sidebar") && !e.target.closest(".menu-toggle")) {
      document.querySelector(".sidebar").classList.remove("active");
    }

    if (
      !e.target.closest(".calendar-widget") &&
      !e.target.closest(".calendar-toggle")
    ) {
      document.querySelector(".calendar-widget").classList.remove("active");
    }
  });
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ctrl+Alt+N for new task
    if (e.ctrlKey && e.altKey && e.key === "n") {
      e.preventDefault();
      openTaskModal();
    }

    // Ctrl+Alt+T for today's view
    if (e.ctrlKey && e.altKey && e.key === "t") {
      e.preventDefault();
      const today = new Date().toISOString().split("T")[0];
      updateCurrentDateDisplay(today);
      renderTasksForDate(today);
    }

    // Ctrl+Alt+C for calendar toggle
    if (e.ctrlKey && e.altKey && e.key === "c") {
      e.preventDefault();
      const calendarWidget = document.querySelector(".calendar-widget");
      if (calendarWidget) {
        calendarWidget.classList.toggle("active");
      }
    }

    // Escape to close modals
    if (e.key === "Escape") {
      closeModal();
    }

    // Arrow keys for calendar navigation when calendar is focused
    if (e.target.closest(".calendar-widget")) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        calendar.prevMonth();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        calendar.nextMonth();
      }
    }
  });
}

function loadTasks() {
  // Load tasks for the current view
  const today = new Date().toISOString().split("T")[0];
  renderTasksForDate(today);

  // Set up search and filter
  setupSearchAndFilter();

  // Show task statistics
  showTaskStatistics();
}

function showTaskStatistics() {
  const totalTasks = taskManager.tasks.length;
  const completedTasks = taskManager.getTasksByStatus("completed").length;
  const overdueTasks = taskManager.getOverdueTasks().length;

  // Update statistics in the UI if elements exist
  const statsContainer = document.querySelector(".task-statistics");
  if (!statsContainer) {
    // Create statistics container
    const header = document.querySelector(".app-header");
    if (header) {
      const stats = document.createElement("div");
      stats.className = "task-statistics";
      stats.innerHTML = `
                <div class="stat-item">
                    <span class="stat-number">${totalTasks}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${completedTasks}</span>
                    <span class="stat-label">Completed</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${overdueTasks}</span>
                    <span class="stat-label">Overdue</span>
                </div>
            `;
      header.appendChild(stats);
    }
  } else {
    // Update existing statistics
    const statNumbers = statsContainer.querySelectorAll(".stat-number");
    if (statNumbers.length >= 3) {
      statNumbers[0].textContent = totalTasks;
      statNumbers[1].textContent = completedTasks;
      statNumbers[2].textContent = overdueTasks;
    }
  }
}
