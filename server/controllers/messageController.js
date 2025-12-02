import Message from '../models/Message.js';

// @desc    Get messages for a channel with pagination
// @route   GET /api/messages/:channelId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ channel: channelId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username email');

    const total = await Message.countDocuments({ channel: channelId });

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new message
// @route   POST /api/messages
// @access  Private
export const createMessage = async (req, res) => {
  try {
    const { channel, content } = req.body;

    const message = await Message.create({
      user: req.user._id,
      channel,
      content,
    });

    const populatedMessage = await Message.findById(message._id).populate(
      'user',
      'username email'
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
