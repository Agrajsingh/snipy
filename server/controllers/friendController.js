import User from '../models/User.js';

// @desc    Search users
// @route   GET /api/friends/search?query=username
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.trim().length === 0) {
      return res.json([]);
    }

    // Search for all users except self
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
          ],
        },
        { _id: { $ne: currentUserId } },
      ],
    })
      .select('username email')
      .limit(20); // Increased limit since showing all users

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send friend request
// @route   POST /api/friends/request/:userId
// @access  Private
export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (targetUser.friends.includes(currentUserId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request already exists
    const requestExists = targetUser.friendRequests.some(
      (req) => req.from.toString() === currentUserId.toString()
    );

    if (requestExists) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Add friend request
    targetUser.friendRequests.push({ from: currentUserId });
    await targetUser.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept friend request
// @route   POST /api/friends/accept/:userId
// @access  Private
export const acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const requestUser = await User.findById(userId);

    if (!requestUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if friend request exists
    const requestIndex = currentUser.friendRequests.findIndex(
      (req) => req.from.toString() === userId
    );

    if (requestIndex === -1) {
      return res.status(400).json({ message: 'Friend request not found' });
    }

    // Remove the friend request
    currentUser.friendRequests.splice(requestIndex, 1);

    // Add to friends list (both users)
    if (!currentUser.friends.includes(userId)) {
      currentUser.friends.push(userId);
    }
    if (!requestUser.friends.includes(currentUserId)) {
      requestUser.friends.push(currentUserId);
    }

    await currentUser.save();
    await requestUser.save();

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject friend request
// @route   POST /api/friends/reject/:userId
// @access  Private
export const rejectFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);

    // Find and remove the friend request
    const requestIndex = currentUser.friendRequests.findIndex(
      (req) => req.from.toString() === userId
    );

    if (requestIndex === -1) {
      return res.status(400).json({ message: 'Friend request not found' });
    }

    currentUser.friendRequests.splice(requestIndex, 1);
    await currentUser.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending friend requests
// @route   GET /api/friends/requests
// @access  Private
export const getPendingRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId).populate(
      'friendRequests.from',
      'username email'
    );

    res.json(currentUser.friendRequests || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get friends list
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId).populate(
      'friends',
      'username email isOnline lastSeen'
    );

    res.json(currentUser.friends || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
