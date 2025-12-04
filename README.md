# Snipy

A real-time team chat application built with the MERN stack (MongoDB, Express, React, Node.js), Socket.io, and TailwindCSS.

## Features

- 🔐 User Authentication (JWT)
- 💬 Real-time Messaging with Socket.io
- 📁 Channel Management (Create, Join, Leave)
- 👥 Online/Offline Presence Tracking
- ⌨️ Typing Indicators
- 📜 Message History with Pagination
- 🎨 Modern UI with TailwindCSS
- 📱 Responsive Design

## Tech Stack

**Frontend:**

- React 18 + Vite
- TailwindCSS
- Zustand (State Management)
- Socket.io Client
- React Router
- Axios
- Lucide React (Icons)
- date-fns (Date Formatting)

**Backend:**

- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT Authentication
- bcryptjs

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- pnpm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd snipy
```

2. Install server dependencies:

```bash
cd server
pnpm install
```

3. Install client dependencies:

```bash
cd ../client
pnpm install
```

4. Set up environment variables:

**Server (.env):**
Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mini-slack
JWT_SECRET=your_jwt_secret_key_change_this
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Client (.env):**
Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running the Application

1. Start MongoDB (if running locally):

```bash
mongod
```

2. Start the backend server:

```bash
cd server
pnpm dev
```

3. Start the frontend (in a new terminal):

```bash
cd client
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Register**: Create a new account
2. **Login**: Sign in with your credentials
3. **Create Channel**: Click the "+" button in the sidebar
4. **Join Channel**: Click on any channel to join and view messages
5. **Send Messages**: Type in the message input and hit send
6. **Online Status**: See who's currently online in the sidebar

## Project Structure

```
snipy/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Login, Register, Chat)
│   │   ├── services/       # API and Socket services
│   │   ├── store/          # Zustand state management
│   │   └── App.jsx         # App routing
│   └── package.json
├── server/                 # Backend Node.js application
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── index.js            # Server entry point
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users

### Channels

- `GET /api/channels` - Get all channels
- `GET /api/channels/:id` - Get specific channel
- `POST /api/channels` - Create new channel
- `POST /api/channels/:id/join` - Join a channel
- `POST /api/channels/:id/leave` - Leave a channel

### Messages

- `GET /api/messages/:channelId` - Get messages (with pagination)
- `POST /api/messages` - Create new message

## Socket Events

### Client → Server

- `user:join` - User connects
- `channel:join` - Join a channel
- `channel:leave` - Leave a channel
- `message:send` - Send a message
- `typing:start` - Start typing
- `typing:stop` - Stop typing

### Server → Client

- `users:online` - Online users list
- `message:new` - New message received
- `typing:start` - User started typing
- `typing:stop` - User stopped typing

## License

MIT

## Author

Built with ❤️ using MERN Stack
