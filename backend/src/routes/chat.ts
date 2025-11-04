import express from 'express';
import { Message } from '../models/Message';
import { UserPresence } from '../models/UserPresence';
// Simple auth middleware for now
const authMiddleware = (req: any, res: any, next: any) => {
  // For now, assume user is authenticated
  // In real implementation, verify JWT token
  req.user = { id: 'user123', name: 'Test User' };
  next();
};

const router = express.Router();

// Get messages for a channel with pagination
router.get('/messages/:channelId', authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    
    const query: any = { channel: channelId };
    if (before) {
      query.timestamp = { $lt: new Date(before as string) };
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .populate('sender', 'name email avatar')
      .lean();

    // Mark messages as read
    const messageIds = messages.map(msg => msg._id);
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { readBy: req.user.id } }
    );

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        hasMore: messages.length === parseInt(limit as string)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    const { content, channel, type = 'text', replyTo, mentions = [], attachments = [], priority = 'normal' } = req.body;

    const message = new Message({
      content,
      sender: req.user.id,
      senderName: req.user.name,
      channel,
      type,
      replyTo,
      mentions,
      attachments,
      priority,
      timestamp: new Date()
    });

    await message.save();
    await message.populate('sender', 'name email avatar');

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Update message (edit)
router.put('/messages/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this message' });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete message
router.delete('/messages/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(messageId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Add reaction to message
router.post('/messages/:messageId/reactions', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    if (existingReaction) {
      if (existingReaction.users.includes(req.user.name)) {
        existingReaction.users = existingReaction.users.filter(u => u !== req.user.name);
        if (existingReaction.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        existingReaction.users.push(req.user.name);
      }
    } else {
      message.reactions.push({
        emoji,
        users: [req.user.name],
        timestamp: new Date()
      });
    }

    await message.save();
    res.json(message);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Pin/unpin message
router.patch('/messages/:messageId/pin', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.isPinned = !message.isPinned;
    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Error pinning message:', error);
    res.status(500).json({ error: 'Failed to pin message' });
  }
});

// Get pinned messages for a channel
router.get('/channels/:channelId/pinned', authMiddleware, async (req, res) => {
  try {
    const { channelId } = req.params;

    const pinnedMessages = await Message.find({
      channel: channelId,
      isPinned: true
    })
    .sort({ timestamp: -1 })
    .populate('sender', 'name email avatar')
    .lean();

    res.json(pinnedMessages);
  } catch (error) {
    console.error('Error fetching pinned messages:', error);
    res.status(500).json({ error: 'Failed to fetch pinned messages' });
  }
});

// Search messages
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q, channel, type, before, after } = req.query;

    const query: any = {};
    
    if (q) {
      query.$text = { $search: q as string };
    }
    
    if (channel) {
      query.channel = channel;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (before || after) {
      query.timestamp = {};
      if (before) query.timestamp.$lt = new Date(before as string);
      if (after) query.timestamp.$gt = new Date(after as string);
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(100)
      .populate('sender', 'name email avatar')
      .lean();

    res.json(messages);
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

// Get user presence information
router.get('/presence', authMiddleware, async (req, res) => {
  try {
    const { channel } = req.query;
    
    const query: any = { status: { $ne: 'offline' } };
    if (channel) {
      query.currentChannel = channel;
    }

    const presenceData = await UserPresence.find(query)
      .populate('userId', 'name email avatar')
      .lean();

    res.json(presenceData);
  } catch (error) {
    console.error('Error fetching presence:', error);
    res.status(500).json({ error: 'Failed to fetch presence data' });
  }
});

// Update user presence
router.post('/presence', authMiddleware, async (req, res) => {
  try {
    const { status, activity, channel } = req.body;

    await UserPresence.findOneAndUpdate(
      { userId: req.user.id },
      {
        status,
        currentActivity: activity,
        currentChannel: channel,
        lastActivity: new Date()
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating presence:', error);
    res.status(500).json({ error: 'Failed to update presence' });
  }
});

// Get message analytics
router.get('/analytics/messages', authMiddleware, async (req, res) => {
  try {
    const { channel, days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

    const query: any = { timestamp: { $gte: daysAgo } };
    if (channel) query.channel = channel;

    const analytics = await Message.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            channel: "$channel"
          },
          messageCount: { $sum: 1 },
          uniqueUsers: { $addToSet: "$sender" },
          reactionCount: { $sum: { $size: "$reactions" } }
        }
      },
      {
        $project: {
          date: "$_id.date",
          channel: "$_id.channel",
          messageCount: 1,
          uniqueUserCount: { $size: "$uniqueUsers" },
          reactionCount: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching message analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;