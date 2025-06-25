# Day Planner

A modern, responsive day planner built with vanilla JavaScript, CSS, and HTML.

## Features

### ✅ Task Management

- **Add Tasks**: Click "Add Task" button or click on any time slot
- **Edit Tasks**: Click on any task to edit details
- **Complete Tasks**: Toggle task completion status
- **Delete Tasks**: Remove tasks with confirmation
- **Priority Levels**: High, Medium, Low priority with color coding
- **Categories**: Work, Personal, Health, Other

### ✅ Calendar Integration

- **Monthly View**: Navigate through months
- **Task Indicators**: Visual dots show tasks on calendar days
- **Date Navigation**: Click calendar days to view tasks
- **Today Highlighting**: Current day is highlighted

### ✅ User Interface

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes
- **Search & Filter**: Find tasks by text, priority, or status
- **Task Statistics**: View total, completed, and overdue tasks
- **Time Slots**: Interactive time slots from 6 AM to 11 PM

### ✅ Navigation

- **Today View**: Current day's tasks
- **Week View**: Weekly overview (placeholder)
- **Month View**: Monthly overview (placeholder)
- **Settings**: Customize theme, time format, and time range

### ✅ Keyboard Shortcuts

- `Ctrl+Alt+N`: New task
- `Ctrl+Alt+T`: Go to today
- `Ctrl+Alt+C`: Toggle calendar
- `Escape`: Close modals

## Usage

### Adding Tasks

1. Click the "Add Task" button in the header
2. Or click on any time slot in the planner
3. Fill in the task details (title, description, date, time, priority, category)
4. Click "Save Task"

### Managing Tasks

- **Complete**: Click the checkmark icon
- **Edit**: Click on the task or edit icon
- **Delete**: Click the trash icon (with confirmation)

### Calendar Navigation

- Use arrow buttons to navigate months
- Click on any date to view tasks for that day
- Calendar shows task indicators with different colors

### Search & Filter

- Use the search box to find tasks by title or description
- Use filter buttons to show:
  - All tasks
  - High priority tasks
  - Completed tasks
  - Overdue tasks

### Settings

- Click "Settings" in the sidebar
- Customize:
  - Theme (Light/Dark/Auto)
  - Time format (12/24 hour)
  - Start and end times for the planner

## Technical Details

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Storage**: LocalStorage for data persistence
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Roboto)
- **Responsive**: Mobile-first design
- **Accessibility**: Keyboard navigation and focus states

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Local Development

1. Clone or download the project
2. Open `index.html` in a web browser
3. Or serve with a local server:
   ```bash
   npx http-server -p 8000
   ```
4. Open `http://localhost:8000` in your browser

## File Structure

```
DAY-PLANNER/
├── index.html          # Main HTML file
├── styles/
│   ├── main.css        # Main styles and layout
│   ├── component.css   # Component styles (modals, tasks, etc.)
│   └── responsive.css  # Responsive design rules
├── scripts/
│   ├── app.js          # Main application logic
│   ├── tasks.js        # Task management
│   ├── calendar.js     # Calendar functionality
│   └── utils.js        # Utility functions
└── assets/
    ├── icons/          # Icon assets
    └── images/         # Image assets
```

## Data Storage

All tasks are stored in the browser's localStorage under the key `dayPlannerTasks`. The data persists between browser sessions but is specific to each browser/device.

## Future Enhancements

- [ ] Week and month view implementations
- [ ] Task categories and tags
- [ ] Export/import functionality
- [ ] Cloud sync
- [ ] Notifications and reminders
- [ ] Task templates
- [ ] Time tracking
- [ ] Progress analytics
