import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
} from '../controllers/directMessageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/:conversationId/messages', protect, getMessages);
router.post('/send/:recipientId', protect, sendMessage);
router.put('/:conversationId/read', protect, markAsRead);

export default router;
