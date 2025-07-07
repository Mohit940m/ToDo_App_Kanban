# Real-Time Kanban To-Do App



## 📝 Project Overview

This is a full-stack, real-time, collaborative Kanban-style To-Do application. It allows teams to manage their tasks seamlessly across different devices. With features like drag-and-drop, real-time updates via WebSockets, and intelligent conflict handling, it's designed to enhance productivity and team collaboration.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: React
-   **Build Tool**: Vite
-   **Real-time Communication**: Socket.IO Client
-   **Styling**: CSS with responsive media queries
-   **UI Components**: Lucide React for icons
-   **Notifications**: React Toastify
-   **Responsiveness**: react-responsive

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB
-   **ODM**: Mongoose
-   **Real-time Communication**: Socket.IO
-   **Authentication**: JSON Web Tokens (JWT)

## 🚀 Setup and Installation

To get this project running locally, follow these steps:

### Prerequisites
-   Node.js (v18 or higher)
-   npm or yarn
-   MongoDB (a local instance or a cloud service like MongoDB Atlas)

### 1. Backend Setup

```bash
# 1. Navigate to the server directory
cd server

# 2. Install dependencies
npm install

# 3. Create a .env file in the /server directory
#    and add the following environment variables:
```

**`server/.env`**
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
```

```bash
# 4. Start the backend server
npm start
```
The backend will be running on `http://localhost:5000`.

### 2. Frontend Setup

```bash
# 1. Open a new terminal and navigate to the client directory
cd client

# 2. Install dependencies
npm install

# 3. Create a .env file in the /client directory
#    and add the following environment variable:
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000
```

```bash
# 4. Start the frontend development server
npm run dev
```
The frontend will be running on `http://localhost:5173` (or another port if 5173 is busy).

## ✨ Features & Usage

-   **Real-time Collaboration**: All changes to tasks (creation, updates, deletion, moves) are instantly broadcast to all connected users.
-   **Kanban Board**:
    -   Visually manage tasks in three columns: **Todo**, **In Progress**, and **Done**.
    -   **Drag & Drop**: Easily move tasks between columns to update their status. Only the task creator or assignee can move a task.
-   **Task Management**:
    -   **Quick Add**: Quickly create a task with just a title.
    -   **Detailed Add**: Use the "Add Task" modal to provide a title, description, status, and assign a user.
    -   **Edit/View**: Click on any task card to open a modal to view or edit its details.
    -   **Delete**: Delete tasks with a confirmation step to prevent accidental removal.
-   **User Assignment**: Assign tasks to specific team members from a dropdown list in the task modal.
-   **Real-time Activity Log**:
    -   A persistent log on desktop (and a toggleable panel on mobile) shows a feed of all actions.
    -   **Highlights**: Your own actions are highlighted in blue, and new actions from others appear with a green pulse animation.
-   **Responsive Design**: The UI is fully optimized for a seamless experience on desktop, tablet, and mobile devices.

## 🧠 Smart Features Explained

### Conflict Handling

To prevent data loss when two users edit the same task simultaneously, the application uses an optimistic locking strategy.

**How it works:**
1.  When you open a task to edit it, the frontend stores its `updatedAt` timestamp.
2.  When you save your changes, this timestamp is sent to the server along with your updates.
3.  The server compares the timestamp you sent with the one currently in the database.
    -   If they match, your update is successful.
    -   If they don't match, it means someone else has updated the task since you opened it. The server rejects your update with a `409 Conflict` status.
4.  The frontend catches this conflict and displays a **Conflict Resolution Modal**. You are given two choices:
    -   **Overwrite**: Force your changes to be saved, overwriting the other user's update.
    -   **Discard**: Cancel your changes and reload the task to see the latest version from the server.

This ensures that no work is lost unknowingly and gives users control over how to resolve editing conflicts.

### Smart Assign (Conceptual)

*While not fully implemented in the current codebase, the "Smart Assign" feature is designed to help teams distribute work more effectively.*

**The Logic:**
The "Smart Assign" feature would be a button or an automatic trigger that assigns a new, unassigned task to a team member based on their current workload. The logic would be:

1.  Query all users and the tasks currently assigned to them.
2.  Count the number of tasks in the "In Progress" state for each user.
3.  The user with the fewest "In Progress" tasks is considered the most available.
4.  The new task is automatically assigned to that user.

This helps in maintaining a balanced workload across the team and prevents any single member from becoming a bottleneck.

