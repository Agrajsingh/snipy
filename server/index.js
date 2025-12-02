import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import User from './models/User.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

// Socket.io for real-time communication
const connectedUsers = new Map(); // socketId -> userId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their user ID
  socket.on('user:join', async (userId) => {
    connectedUsers.set(socket.id, userId);
    
    // Update user status to online
    await User.findByIdAndUpdate(userId, { isOnline: true });
    
    // Broadcast updated user list
    const onlineUsers = Array.from(connectedUsers.values());
    io.emit('users:online', onlineUsers);
    
    console.log(`User ${userId} is now online`);
  });

  // User joins a channel
  socket.on('channel:join', (channelId) => {
    socket.join(channelId);
    console.log(`Socket ${socket.id} joined channel ${channelId}`);
  });

  // User leaves a channel
  socket.on('channel:leave', (channelId) => {
    socket.leave(channelId);
    console.log(`Socket ${socket.id} left channel ${channelId}`);
  });

  // New message
  socket.on('message:send', async (messageData) => {
    try {
      const message = await Message.create(messageData);
      const populatedMessage = await Message.findById(message._id).populate(
        'user',
        'username email'
      );

      // Emit to all users in the channel
      io.to(messageData.channel).emit('message:new', populatedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('message:error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing:start', ({ channelId, username }) => {
    socket.to(channelId).emit('typing:start', { username });
  });

  socket.on('typing:stop', ({ channelId, username }) => {
    socket.to(channelId).emit('typing:stop', { username });
  });

  // Disconnect
  socket.on('disconnect', async () => {
    const userId = connectedUsers.get(socket.id);
    
    if (userId) {
      // Update user status to offline
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
      
      connectedUsers.delete(socket.id);
      
      // Broadcast updated user list
      const onlineUsers = Array.from(connectedUsers.values());
      io.emit('users:online', onlineUsers);
      
      console.log(`User ${userId} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
