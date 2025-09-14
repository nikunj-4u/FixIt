const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data for demo
const mockUsers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    studentId: 'STU001',
    roomNumber: 'A-101',
    phone: '1234567890',
    isActive: true
  },
  {
    _id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    phone: '1234567891',
    isActive: true
  }
];

const mockComplaints = [
  {
    _id: '1',
    title: 'Water leakage in room',
    description: 'There is a water leakage in my room A-101. Water is dripping from the ceiling.',
    category: 'water',
    priority: 'high',
    status: 'pending',
    student: mockUsers[0],
    roomNumber: 'A-101',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Internet connectivity issues',
    description: 'Internet is very slow in my room. Cannot access online classes properly.',
    category: 'internet',
    priority: 'medium',
    status: 'in_progress',
    student: mockUsers[0],
    roomNumber: 'A-101',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockCategories = [
  { _id: '1', name: 'mess', description: 'Mess related complaints', icon: 'fas fa-utensils', color: '#ff9800' },
  { _id: '2', name: 'internet', description: 'Internet connectivity issues', icon: 'fas fa-wifi', color: '#2196f3' },
  { _id: '3', name: 'water', description: 'Water supply issues', icon: 'fas fa-tint', color: '#00bcd4' },
  { _id: '4', name: 'electricity', description: 'Electrical problems', icon: 'fas fa-bolt', color: '#ffeb3b' },
  { _id: '5', name: 'room_maintenance', description: 'Room maintenance issues', icon: 'fas fa-home', color: '#4caf50' },
  { _id: '6', name: 'security', description: 'Security concerns', icon: 'fas fa-shield-alt', color: '#f44336' },
  { _id: '7', name: 'other', description: 'Other issues', icon: 'fas fa-tools', color: '#9e9e9e' }
];

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  req.user = { userId: '1', role: 'student' };
  next();
};

const mockAdminAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  req.user = { userId: '2', role: 'admin' };
  next();
};

// Routes
// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = 'mock-jwt-token';
  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      roomNumber: user.roomNumber
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, role = 'student', studentId, roomNumber } = req.body;
  
  const newUser = {
    _id: (mockUsers.length + 1).toString(),
    name,
    email,
    role,
    studentId,
    roomNumber,
    phone,
    isActive: true
  };
  
  mockUsers.push(newUser);
  
  const token = 'mock-jwt-token';
  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      studentId: newUser.studentId,
      roomNumber: newUser.roomNumber
    }
  });
});

app.get('/api/auth/me', mockAuth, (req, res) => {
  const user = mockUsers.find(u => u._id === req.user.userId);
  res.json(user);
});

// Complaints routes
app.get('/api/complaints', mockAuth, (req, res) => {
  const { status, category, priority, page = 1, limit = 10 } = req.query;
  let filteredComplaints = [...mockComplaints];
  
  if (status) filteredComplaints = filteredComplaints.filter(c => c.status === status);
  if (category) filteredComplaints = filteredComplaints.filter(c => c.category === category);
  if (priority) filteredComplaints = filteredComplaints.filter(c => c.priority === priority);
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedComplaints = filteredComplaints.slice(startIndex, endIndex);
  
  res.json({
    complaints: paginatedComplaints,
    totalPages: Math.ceil(filteredComplaints.length / limit),
    currentPage: parseInt(page),
    total: filteredComplaints.length
  });
});

app.get('/api/complaints/:id', mockAuth, (req, res) => {
  const complaint = mockComplaints.find(c => c._id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found' });
  }
  res.json(complaint);
});

app.post('/api/complaints', mockAuth, (req, res) => {
  const { title, description, category, priority = 'medium', roomNumber, images } = req.body;
  
  const newComplaint = {
    _id: (mockComplaints.length + 1).toString(),
    title,
    description,
    category,
    priority,
    roomNumber,
    student: mockUsers.find(u => u._id === req.user.userId),
    images: images || [],
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockComplaints.push(newComplaint);
  
  res.status(201).json({
    message: 'Complaint created successfully',
    complaint: newComplaint
  });
});

app.patch('/api/complaints/:id/status', mockAdminAuth, (req, res) => {
  const { status, resolution } = req.body;
  const complaint = mockComplaints.find(c => c._id === req.params.id);
  
  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found' });
  }
  
  complaint.status = status;
  if (resolution) complaint.resolution = resolution;
  if (status === 'resolved') {
    complaint.resolvedAt = new Date().toISOString();
    complaint.resolvedBy = mockUsers.find(u => u._id === req.user.userId);
  }
  complaint.updatedAt = new Date().toISOString();
  
  res.json({
    message: 'Complaint status updated successfully',
    complaint
  });
});

app.post('/api/complaints/:id/comments', mockAuth, (req, res) => {
  const { comment } = req.body;
  const complaint = mockComplaints.find(c => c._id === req.params.id);
  
  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found' });
  }
  
  if (!complaint.comments) complaint.comments = [];
  
  complaint.comments.push({
    user: mockUsers.find(u => u._id === req.user.userId),
    comment,
    createdAt: new Date().toISOString()
  });
  
  res.json({
    message: 'Comment added successfully',
    complaint
  });
});

app.get('/api/complaints/stats/overview', mockAdminAuth, (req, res) => {
  const statusStats = [
    { _id: 'pending', count: mockComplaints.filter(c => c.status === 'pending').length },
    { _id: 'in_progress', count: mockComplaints.filter(c => c.status === 'in_progress').length },
    { _id: 'resolved', count: mockComplaints.filter(c => c.status === 'resolved').length },
    { _id: 'closed', count: mockComplaints.filter(c => c.status === 'closed').length }
  ];
  
  const categoryStats = mockCategories.map(cat => ({
    _id: cat.name,
    count: mockComplaints.filter(c => c.category === cat.name).length
  }));
  
  const priorityStats = [
    { _id: 'low', count: mockComplaints.filter(c => c.priority === 'low').length },
    { _id: 'medium', count: mockComplaints.filter(c => c.priority === 'medium').length },
    { _id: 'high', count: mockComplaints.filter(c => c.priority === 'high').length },
    { _id: 'urgent', count: mockComplaints.filter(c => c.priority === 'urgent').length }
  ];
  
  res.json({
    statusStats,
    categoryStats,
    priorityStats
  });
});

// Users routes
app.get('/api/users', mockAdminAuth, (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;
  let filteredUsers = [...mockUsers];
  
  if (role) filteredUsers = filteredUsers.filter(u => u.role === role);
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  res.json({
    users: paginatedUsers,
    totalPages: Math.ceil(filteredUsers.length / limit),
    currentPage: parseInt(page),
    total: filteredUsers.length
  });
});

app.get('/api/users/staff', mockAdminAuth, (req, res) => {
  const staff = mockUsers.filter(u => ['technician', 'warden', 'admin'].includes(u.role));
  res.json(staff);
});

app.patch('/api/users/profile', mockAuth, (req, res) => {
  const { name, phone, roomNumber } = req.body;
  const user = mockUsers.find(u => u._id === req.user.userId);
  
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (roomNumber) user.roomNumber = roomNumber;
  
  res.json({
    message: 'Profile updated successfully',
    user
  });
});

// Categories routes
app.get('/api/categories', (req, res) => {
  res.json(mockCategories);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Demo server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 Backend API: http://localhost:5000`);
  console.log(`\n🎯 Demo Credentials:`);
  console.log(`   Student: john@example.com / any password`);
  console.log(`   Admin: admin@example.com / any password`);
});

module.exports = app;
