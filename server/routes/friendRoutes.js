import express from 'express';
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingRequests,
  getFriends,
} from '../controllers/friendController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.post('/request/:userId', protect, sendFriendRequest);
router.post('/accept/:userId', protect, acceptFriendRequest);
router.post('/reject/:userId', protect, rejectFriendRequest);
router.get('/requests', protect, getPendingRequests);
router.get('/', protect, getFriends);

export default router;
