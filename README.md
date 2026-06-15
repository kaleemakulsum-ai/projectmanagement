# Project Management Tool

A Trello-like project management application built with React.js, Node.js, Express.js, and MongoDB.

## Features

* JWT Authentication
* Project Boards
* Task Cards
* Task Assignment
* Comments and Collaboration
* Real-time Notifications
* Socket.IO Integration
* Drag and Drop Task Management

## Tech Stack

### Frontend

* React.js
* React Router
* Axios
* Socket.io-client
* React Beautiful DnD
* TailwindCSS

### Backend

* Node.js
* Express.js
* MongoDB with Mongoose
* Socket.IO
* JWT Authentication
* bcryptjs

## Prerequisites

* Node.js (v14 or higher)
* MongoDB

## Installation

1. Install dependencies:

```bash
npm run install-all
```

2. Configure MongoDB and environment variables.

3. Start the application:

```bash
npm run dev
```

### Application URLs

* localhost:3000
## Usage

1. Register an account
2. Create a project board
3. Add lists and cards
4. Organize tasks using drag and drop
5. Assign tasks to team members
6. Collaborate through comments

## API Endpoints

### Authentication

* POST /api/auth/register
* POST /api/auth/login
* GET /api/auth/user

### Projects

* GET /api/projects
* POST /api/projects
* GET /api/projects/:id
* PUT /api/projects/:id
* DELETE /api/projects/:id

### Boards

* GET /api/boards/:projectId
* POST /api/boards
* PUT /api/boards/:id
* DELETE /api/boards/:id

### Lists

* GET /api/lists/:boardId
* POST /api/lists
* PUT /api/lists/:id
* DELETE /api/lists/:id

### Cards

* GET /api/cards/:listId
* POST /api/cards
* PUT /api/cards/:id
* DELETE /api/cards/:id

### Comments

* GET /api/comments/:cardId
* POST /api/comments
* DELETE /api/comments/:id

### Notifications

* GET /api/notifications
* PUT /api/notifications/:id/read

## Author

Kulsum

GitHub Repository:
https://github.com/kaleemakulsum-ai/projectmanagement
