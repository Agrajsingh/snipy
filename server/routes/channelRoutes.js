import express from 'express';
import {
  getChannels,
  getChannel,
  createChannel,
  joinChannel,
  leaveChannel,
} from '../controllers/channelController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getChannels).post(protect, createChannel);
router.route('/:id').get(protect, getChannel);
router.route('/:id/join').post(protect, joinChannel);
router.route('/:id/leave').post(protect, leaveChannel);

export default router;
