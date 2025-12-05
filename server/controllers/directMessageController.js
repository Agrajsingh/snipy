import Conversation from '../models/Conversation.js';
import DirectMessage from '../models/DirectMessage.js';
import User from '../models/User.js';

// @desc    Get user's conversations
// @route   GET /api/dm/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate('participants', 'username email isOnline lastSeen')
      .sort({ lastMessageAt: -1 });

    // Format conversations to include the other participant
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== currentUserId.toString()
      );

      return {
        _id: conv._id,
        participant: otherParticipant,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount.get(currentUserId.toString()) || 0,
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/dm/:conversationId/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(currentUserId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await DirectMessage.find({ conversation: conversationId })
      .populate('sender', 'username email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send direct message
// @route   POST /api/dm/send/:recipientId
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const { content } = req.body;
    const currentUserId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content required' });
    }

    // Verify recipient exists and is a friend
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser.friends.includes(recipientId)) {
      return res.status(403).json({ message: 'Can only message friends' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, recipientId],
        lastMessage: content,
        lastMessageAt: new Date(),
        unreadCount: { [recipientId]: 1 },
      });
    } else {
      // Update conversation
      conversation.lastMessage = content;
      conversation.lastMessageAt = new Date();
      const currentUnread = conversation.unreadCount.get(recipientId.toString()) || 0;
      conversation.unreadCount.set(recipientId.toString(), currentUnread + 1);
      await conversation.save();
    }

    // Create message
    const message = await DirectMessage.create({
      conversation: conversation._id,
      sender: currentUserId,
      content: content.trim(),
    });

    const populatedMessage = await DirectMessage.findById(message._id).populate(
      'sender',
      'username email'
    );

    res.status(201).json({
      message: populatedMessage,
      conversationId: conversation._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/dm/:conversationId/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(currentUserId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark all unread messages as read
    await DirectMessage.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: currentUserId },
        isRead: false,
      },
      { isRead: true }
    );

    // Reset unread count for current user
    conversation.unreadCount.set(currentUserId.toString(), 0);
    await conversation.save();

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
