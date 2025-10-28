const express = require('express');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all complaints (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    const filter = {};

    // Apply filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Students can only see their own complaints
    if (req.user.role === 'student') {
      filter.student = req.user.userId;
    }

    const complaints = await Complaint.find(filter)
      .populate('student', 'name email studentId roomNumber')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(filter);

    res.json({
      complaints,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single complaint
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email studentId roomNumber')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email role')
      .populate('comments.user', 'name role');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Students can only view their own complaints
    if (req.user.role === 'student' && complaint.student._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create complaint
router.post('/', [
  auth,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['mess', 'internet', 'water', 'electricity', 'room_maintenance', 'security', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('roomNumber').trim().notEmpty().withMessage('Room number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, priority = 'medium', roomNumber, images } = req.body;

    const complaint = new Complaint({
      title,
      description,
      category,
      priority,
      roomNumber,
      student: req.user.userId,
      images: images || []
    });

    await complaint.save();
    await complaint.populate('student', 'name email studentId roomNumber');

    res.status(201).json({
      message: 'Complaint created successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update complaint status (Admin only)
router.patch('/:id/status', [adminAuth, body('status').isIn(['pending', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status')], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, resolution } = req.body;

    // Load existing complaint to enforce final-state lock
    const existing = await Complaint.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (existing.status === 'resolved' || existing.status === 'closed') {
      return res.status(400).json({ message: 'Status cannot be changed after resolution/closure' });
    }

    const updateData = { status };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = req.user.userId;
      if (resolution) updateData.resolution = resolution;
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('student', 'name email studentId roomNumber')
     .populate('assignedTo', 'name email role')
     .populate('resolvedBy', 'name email role');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign complaint (Admin only)
router.patch('/:id/assign', [adminAuth, body('assignedTo').isMongoId().withMessage('Valid user ID required')], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assignedTo } = req.body;

    // Check if assigned user exists and has appropriate role
    const user = await User.findById(assignedTo);
    if (!user || !['technician', 'admin', 'warden'].includes(user.role)) {
      return res.status(400).json({ message: 'Invalid user for assignment' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status: 'in_progress' },
      { new: true }
    ).populate('student', 'name email studentId roomNumber')
     .populate('assignedTo', 'name email role');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({
      message: 'Complaint assigned successfully',
      complaint
    });
  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comments', [auth, body('comment').trim().notEmpty().withMessage('Comment is required')], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { comment } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Students can only comment on their own complaints
    if (req.user.role === 'student' && complaint.student.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    complaint.comments.push({
      user: req.user.userId,
      comment
    });

    await complaint.save();
    await complaint.populate('comments.user', 'name role');

    res.json({
      message: 'Comment added successfully',
      complaint
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get complaint statistics (Admin only)
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statusStats: stats,
      categoryStats,
      priorityStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
