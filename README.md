# Project Management Tool

A Trello-like project management application built with React.js, Node.js, Express.js, and MongoDB.

## Features

- **JWT Authentication**: Secure user authentication with JWT tokens
- **Project Boards**: Create and manage project boards
- **Task Cards**: Create, edit, and organize task cards
- **Task Assignment**: Assign tasks to team members
- **Comments**: Add comments to tasks for collaboration
- **Notifications**: Real-time notifications for updates
- **Socket.IO**: Real-time updates across connected clients
- **Drag and Drop**: Intuitive drag-and-drop interface for task management

## Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Socket.io-client
- React Beautiful DnD
- TailwindCSS

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT Authentication
- bcryptjs

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (either local installation or MongoDB Atlas account)

### Setup

1. Clone the repository

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Configure MongoDB:
   
   **Option A: Local MongoDB**
   - Install MongoDB locally from https://www.mongodb.com/try/download/community
   - Start MongoDB service
   - Use the default connection string in `.env`: `mongodb://localhost:27017/projectmanagement`
   
   **Option B: MongoDB Atlas (Cloud)**
   - Create a free account at https://www.mongodb.com/cloud/atlas
   - Create a new cluster
   - Get your connection string
   - Update `.env` file with your Atlas connection string:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/projectmanagement
     ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   - Edit `.env` and set your MongoDB URI
   - Set a secure JWT secret key

5. Start the development servers:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Usage

1. Register a new account
2. Create a project board
3. Add lists and cards
4. Drag and drop cards to organize tasks
5. Assign tasks to team members
6. Add comments and collaborate in real-time

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/user - Get current user

### Projects
- GET /api/projects - Get all projects
- POST /api/projects - Create new project
- GET /api/projects/:id - Get project by ID
- PUT /api/projects/:id - Update project
- DELETE /api/projects/:id - Delete project

### Boards
- GET /api/boards/:projectId - Get all boards for a project
- POST /api/boards - Create new board
- PUT /api/boards/:id - Update board
- DELETE /api/boards/:id - Delete board

### Lists
- GET /api/lists/:boardId - Get all lists for a board
- POST /api/lists - Create new list
- PUT /api/lists/:id - Update list
- DELETE /api/lists/:id - Delete list

### Cards
- GET /api/cards/:listId - Get all cards for a list
- POST /api/cards - Create new card
- PUT /api/cards/:id - Update card
- DELETE /api/cards/:id - Delete card

### Comments
- GET /api/comments/:cardId - Get all comments for a card
- POST /api/comments - Create new comment
- DELETE /api/comments/:id - Delete comment

### Notifications
- GET /api/notifications - Get all notifications for user
- PUT /api/notifications/:id/read - Mark notification as read

## License

ISC
