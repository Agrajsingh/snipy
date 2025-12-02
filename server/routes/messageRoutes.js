import express from 'express';
import { getMessages, createMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:channelId').get(protect, getMessages);
router.route('/').post(protect, createMessage);

export default router;
