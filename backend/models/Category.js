const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String, // Icon class or URL
    default: 'fas fa-tools'
  },
  color: {
    type: String,
    default: '#007bff'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
