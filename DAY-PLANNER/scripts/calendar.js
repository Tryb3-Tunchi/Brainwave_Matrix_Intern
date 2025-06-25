class Calendar {
  constructor() {
    this.currentDate = new Date();
    this.render();
  }

  render() {
    this.renderMonthTitle();
    this.renderDaysOfWeek();
    this.renderCalendarDays();
  }

  renderMonthTitle() {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthTitle = `${
      monthNames[this.currentDate.getMonth()]
    } ${this.currentDate.getFullYear()}`;
    const monthElement = document.getElementById("calendar-month");
    if (monthElement) {
      monthElement.textContent = monthTitle;
    }
  }

  renderDaysOfWeek() {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysContainer = document.getElementById("calendar-days");
    if (!daysContainer) return;

    daysContainer.innerHTML = "";

    // Create day name headers
    dayNames.forEach((day) => {
      const dayElement = document.createElement("div");
      dayElement.className = "day-name";
      dayElement.textContent = day;
      daysContainer.appendChild(dayElement);
    });
  }

  renderCalendarDays() {
    const daysContainer = document.getElementById("calendar-days");
    if (!daysContainer) return;

    // Get first day of month and total days in month
    const firstDay = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1
    );
    const totalDays = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      0
    ).getDate();

    // Get day of week for first day (0-6)
    const startDay = firstDay.getDay();

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "day empty";
      daysContainer.appendChild(emptyDay);
    }

    // Add days of the month
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${this.currentDate.getFullYear()}-${String(
        this.currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const dayElement = document.createElement("div");
      dayElement.className = "day";
      dayElement.textContent = i;
      dayElement.dataset.date = dateStr;

      // Highlight current day
      const today = new Date();
      if (
        this.currentDate.getFullYear() === today.getFullYear() &&
        this.currentDate.getMonth() === today.getMonth() &&
        i === today.getDate()
      ) {
        dayElement.classList.add("today");
      }

      // Add task indicators
      if (typeof taskManager !== "undefined") {
        const tasksForDay = taskManager.getTasksForDate(dateStr);
        if (tasksForDay.length > 0) {
          dayElement.classList.add("has-tasks");

          const completedTasks = tasksForDay.filter(
            (task) => task.status === "completed"
          ).length;
          if (completedTasks === tasksForDay.length) {
            dayElement.classList.add("has-completed");
            dayElement.classList.remove("has-tasks");
          }

          const overdueTasks = tasksForDay.filter((task) => {
            const taskDate = new Date(`${task.date}T${task.endTime}`);
            return task.status !== "completed" && taskDate < new Date();
          }).length;

          if (overdueTasks > 0) {
            dayElement.classList.add("has-overdue");
          }
        }
      }

      // Add click event to navigate to day
      dayElement.addEventListener("click", () => {
        this.navigateToDate(dateStr);
      });

      daysContainer.appendChild(dayElement);
    }
  }

  navigateToDate(dateString) {
    const [year, month, day] = dateString.split("-");
    this.currentDate = new Date(year, month - 1, day);
    this.render();

    // Update the main view to show tasks for this date
    if (typeof updateCurrentDateDisplay === "function") {
      updateCurrentDateDisplay(dateString);
    }
    if (typeof renderTasksForDate === "function") {
      renderTasksForDate(dateString);
    }

    // Close calendar on mobile
    const calendarWidget = document.querySelector(".calendar-widget");
    if (calendarWidget) {
      calendarWidget.classList.remove("active");
    }
  }

  prevMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.render();
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
    this.render();
  }
}

// Update current date display
function updateCurrentDateDisplay(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const currentDateElement = document.getElementById("current-date");
  if (currentDateElement) {
    currentDateElement.textContent = date.toLocaleDateString("en-US", options);
  }

  // Update the "Today" header if needed
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const dateDisplayH1 = document.querySelector(".date-display h1");
  if (dateDisplayH1) {
    dateDisplayH1.textContent = isToday
      ? "Today"
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}
