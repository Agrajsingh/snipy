import Channel from '../models/Channel.js';

// @desc    Get all channels
// @route   GET /api/channels
// @access  Private
export const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find({})
      .populate('createdBy', 'username')
      .populate('members', 'username email isOnline');
    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single channel
// @route   GET /api/channels/:id
// @access  Private
export const getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('members', 'username email isOnline');

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new channel
// @route   POST /api/channels
// @access  Private
export const createChannel = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    // Check if channel exists
    const channelExists = await Channel.findOne({ name });

    if (channelExists) {
      return res.status(400).json({ message: 'Channel already exists' });
    }

    const channel = await Channel.create({
      name,
      description,
      isPrivate: isPrivate || false,
      createdBy: req.user._id,
      members: [req.user._id], // Creator automatically joins
    });

    const populatedChannel = await Channel.findById(channel._id)
      .populate('createdBy', 'username')
      .populate('members', 'username email isOnline');

    res.status(201).json(populatedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a channel
// @route   POST /api/channels/:id/join
// @access  Private
export const joinChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if already a member
    if (channel.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    channel.members.push(req.user._id);
    await channel.save();

    const populatedChannel = await Channel.findById(channel._id)
      .populate('createdBy', 'username')
      .populate('members', 'username email isOnline');

    res.json(populatedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave a channel
// @route   POST /api/channels/:id/leave
// @access  Private
export const leaveChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if member
    if (!channel.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Not a member of this channel' });
    }

    channel.members = channel.members.filter(
      (memberId) => memberId.toString() !== req.user._id.toString()
    );
    await channel.save();

    res.json({ message: 'Left channel successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
