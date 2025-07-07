# Activity Log Component

## Overview
The Activity Log component provides real-time tracking of user actions within the Todo App Kanban board. It displays the last 20 actions performed by users in a responsive layout.

## Features

### Desktop (≥768px)
- **Placement**: Fixed right side panel
- **Behavior**: Fixed position with scrollable content
- **Width**: 350px
- **Height**: Full viewport height minus header

### Mobile (<768px)
- **Placement**: Bottom panel
- **Behavior**: Toggleable with floating action button
- **Height**: Up to 60% of viewport height
- **Toggle**: Floating button in bottom-right corner

## Components

### ActivityLogContainer
- Main container that handles responsive behavior
- Fetches data using `useActivityLog` hook
- Determines which component to render based on screen size

### ActivityLogDesktop
- Fixed right panel for desktop devices
- Scrollable content area
- Always visible

### ActivityLogMobile
- Bottom panel for mobile devices
- Toggleable visibility
- Floating action button for easy access

## API Integration

### Endpoint
- `GET /api/actions` - Fetches the last 20 actions

### Data Structure
```javascript
{
  _id: "action_id",
  user: {
    _id: "user_id",
    name: "User Name",
    email: "user@example.com"
  },
  actionType: "create|edit|delete|assign|move",
  task: {
    _id: "task_id",
    title: "Task Title"
  },
  description: "Human readable action description",
  createdAt: "2023-12-01T10:00:00.000Z"
}
```

## Styling

### CSS Classes
- `.activity-log-desktop` - Desktop panel
- `.activity-log-mobile` - Mobile panel
- `.activity-log-floating-toggle` - Mobile toggle button
- `.log-item` - Individual log entry
- `.log-item.highlight` - Current user's actions

### Responsive Breakpoints
- Desktop: `min-width: 768px`
- Mobile: `max-width: 767px`

## Usage

```jsx
import ActivityLogContainer from './components/ActivityLog/ActivityLogContainer';

function App() {
  return (
    <div>
      {/* Your app content */}
      <ActivityLogContainer />
    </div>
  );
}
```

## Auto-refresh
The activity log automatically refreshes every 30 seconds to show the latest actions.

## Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode support
- Reduced motion support