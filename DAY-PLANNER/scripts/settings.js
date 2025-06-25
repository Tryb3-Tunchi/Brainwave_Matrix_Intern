// Settings Management
class SettingsManager {
  constructor() {
    this.settings = this.loadSettings();
    this.initSettings();
    this.bindEvents();
  }

  // Default settings
  getDefaultSettings() {
    return {
      theme: "light",
      primaryColor: "#4285f4",
      timeFormat: "12",
      dayStart: "06:00",
      dayEnd: "23:00",
      defaultPriority: "medium",
      defaultDuration: "60",
      showDescriptions: true,
    };
  }

  // Load settings from localStorage
  loadSettings() {
    const saved = localStorage.getItem("dayPlannerSettings");
    if (saved) {
      try {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
      } catch (error) {
        console.error("Error loading settings:", error);
        return this.getDefaultSettings();
      }
    }
    return this.getDefaultSettings();
  }

  // Save settings to localStorage
  saveSettings() {
    try {
      localStorage.setItem("dayPlannerSettings", JSON.stringify(this.settings));
      this.applySettings();
      this.showToast("Settings saved successfully!", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      this.showToast("Error saving settings", "error");
    }
  }

  // Apply settings to the UI
  applySettings() {
    // Apply theme
    document.documentElement.setAttribute("data-theme", this.settings.theme);

    // Apply primary color
    if (this.settings.primaryColor) {
      document.documentElement.style.setProperty(
        "--primary-color",
        this.settings.primaryColor
      );
    }

    // Apply other settings
    this.updateTimeFormat();
    this.updateDayRange();
  }

  // Initialize settings UI
  initSettings() {
    // Set form values
    const themeSelect = document.getElementById("theme-select");
    const primaryColor = document.getElementById("primary-color");
    const timeFormat = document.getElementById("time-format");
    const dayStart = document.getElementById("day-start");
    const dayEnd = document.getElementById("day-end");
    const defaultPriority = document.getElementById("default-priority");
    const defaultDuration = document.getElementById("default-duration");
    const showDescriptions = document.getElementById("show-descriptions");

    if (themeSelect) themeSelect.value = this.settings.theme;
    if (primaryColor) primaryColor.value = this.settings.primaryColor;
    if (timeFormat) timeFormat.value = this.settings.timeFormat;
    if (dayStart) dayStart.value = this.settings.dayStart;
    if (dayEnd) dayEnd.value = this.settings.dayEnd;
    if (defaultPriority) defaultPriority.value = this.settings.defaultPriority;
    if (defaultDuration) defaultDuration.value = this.settings.defaultDuration;
    if (showDescriptions)
      showDescriptions.checked = this.settings.showDescriptions;

    // Apply settings immediately
    this.applySettings();
  }

  // Bind event listeners
  bindEvents() {
    // Settings form events
    const themeSelect = document.getElementById("theme-select");
    const primaryColor = document.getElementById("primary-color");
    const timeFormat = document.getElementById("time-format");
    const dayStart = document.getElementById("day-start");
    const dayEnd = document.getElementById("day-end");
    const defaultPriority = document.getElementById("default-priority");
    const defaultDuration = document.getElementById("default-duration");
    const showDescriptions = document.getElementById("show-descriptions");

    if (themeSelect) {
      themeSelect.addEventListener("change", (e) => {
        this.settings.theme = e.target.value;
        this.applySettings();
      });
    }

    if (primaryColor) {
      primaryColor.addEventListener("change", (e) => {
        this.settings.primaryColor = e.target.value;
        this.applySettings();
      });
    }

    if (timeFormat) {
      timeFormat.addEventListener("change", (e) => {
        this.settings.timeFormat = e.target.value;
        this.updateTimeFormat();
      });
    }

    if (dayStart) {
      dayStart.addEventListener("change", (e) => {
        this.settings.dayStart = e.target.value;
        this.updateDayRange();
      });
    }

    if (dayEnd) {
      dayEnd.addEventListener("change", (e) => {
        this.settings.dayEnd = e.target.value;
        this.updateDayRange();
      });
    }

    if (defaultPriority) {
      defaultPriority.addEventListener("change", (e) => {
        this.settings.defaultPriority = e.target.value;
      });
    }

    if (defaultDuration) {
      defaultDuration.addEventListener("change", (e) => {
        this.settings.defaultDuration = e.target.value;
      });
    }

    if (showDescriptions) {
      showDescriptions.addEventListener("change", (e) => {
        this.settings.showDescriptions = e.target.checked;
      });
    }

    // Action buttons
    const saveBtn = document.getElementById("save-settings-btn");
    const resetBtn = document.getElementById("reset-btn");
    const exportBtn = document.getElementById("export-btn");
    const importBtn = document.getElementById("import-btn");
    const clearBtn = document.getElementById("clear-btn");

    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveSettings());
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetToDefaults());
    }

    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportData());
    }

    if (importBtn) {
      importBtn.addEventListener("click", () => this.importData());
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clearAllData());
    }
  }

  // Update time format display
  updateTimeFormat() {
    // This will be called by the main app to update time displays
    if (window.taskManager) {
      window.taskManager.updateTimeFormat(this.settings.timeFormat);
    }
  }

  // Update day range
  updateDayRange() {
    // This will be called by the main app to update time slots
    if (window.taskManager) {
      window.taskManager.updateDayRange(
        this.settings.dayStart,
        this.settings.dayEnd
      );
    }
  }

  // Reset to default settings
  resetToDefaults() {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      this.settings = this.getDefaultSettings();
      this.initSettings();
      this.saveSettings();
      this.showToast("Settings reset to defaults", "info");
    }
  }

  // Export data
  exportData() {
    try {
      const data = {
        tasks: JSON.parse(localStorage.getItem("dayPlannerTasks") || "[]"),
        settings: this.settings,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `day-planner-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast("Data exported successfully!", "success");
    } catch (error) {
      console.error("Error exporting data:", error);
      this.showToast("Error exporting data", "error");
    }
  }

  // Import data
  importData() {
    const fileInput = document.getElementById("import-file");
    if (fileInput) {
      fileInput.click();
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result);

              if (data.tasks && Array.isArray(data.tasks)) {
                localStorage.setItem(
                  "dayPlannerTasks",
                  JSON.stringify(data.tasks)
                );
              }

              if (data.settings) {
                this.settings = { ...this.settings, ...data.settings };
                this.initSettings();
                this.saveSettings();
              }

              this.showToast("Data imported successfully!", "success");

              // Refresh the page to apply changes
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } catch (error) {
              console.error("Error importing data:", error);
              this.showToast("Invalid file format", "error");
            }
          };
          reader.readAsText(file);
        }
      };
    }
  }

  // Clear all data
  clearAllData() {
    if (
      confirm(
        "Are you sure you want to clear all data? This action cannot be undone!"
      )
    ) {
      try {
        localStorage.removeItem("dayPlannerTasks");
        localStorage.removeItem("dayPlannerSettings");
        this.settings = this.getDefaultSettings();
        this.initSettings();
        this.saveSettings();
        this.showToast("All data cleared successfully", "info");

        // Refresh the page
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error("Error clearing data:", error);
        this.showToast("Error clearing data", "error");
      }
    }
  }

  // Show toast notification
  showToast(message, type = "info") {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  // Get setting value
  getSetting(key) {
    return this.settings[key];
  }

  // Set setting value
  setSetting(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }
}

// Initialize settings when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.settingsManager = new SettingsManager();
});

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = SettingsManager;
}
