const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock data
const mockComplaints = [
  {
    _id: '1',
    title: 'Water leakage in room A-101',
    description: 'There is a water leakage in my room. Water is dripping from the ceiling and damaging my belongings.',
    category: 'water',
    priority: 'high',
    status: 'pending',
    student: { name: 'John Doe', email: 'john@example.com', studentId: 'STU001' },
    roomNumber: 'A-101',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Internet connectivity issues',
    description: 'Internet is very slow in my room. Cannot access online classes properly.',
    category: 'internet',
    priority: 'medium',
    status: 'in_progress',
    student: { name: 'John Doe', email: 'john@example.com', studentId: 'STU001' },
    roomNumber: 'A-101',
    createdAt: new Date().toISOString()
  }
];

const mockCategories = [
  { _id: '1', name: 'mess', description: 'Mess related complaints' },
  { _id: '2', name: 'internet', description: 'Internet connectivity issues' },
  { _id: '3', name: 'water', description: 'Water supply issues' },
  { _id: '4', name: 'electricity', description: 'Electrical problems' },
  { _id: '5', name: 'room_maintenance', description: 'Room maintenance issues' }
];

// Routes
app.get('/api/categories', (req, res) => {
  res.json(mockCategories);
});

app.get('/api/complaints', (req, res) => {
  res.json({
    complaints: mockComplaints,
    totalPages: 1,
    currentPage: 1,
    total: mockComplaints.length
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({
    message: 'Login successful',
    token: 'demo-token',
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      studentId: 'STU001',
      roomNumber: 'A-101'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    message: 'Registration successful',
    token: 'demo-token',
    user: {
      id: '1',
      name: req.body.name,
      email: req.body.email,
      role: 'student',
      studentId: req.body.studentId,
      roomNumber: req.body.roomNumber
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    studentId: 'STU001',
    roomNumber: 'A-101',
    phone: '1234567890',
    isActive: true
  });
});

app.post('/api/complaints', (req, res) => {
  const newComplaint = {
    _id: (mockComplaints.length + 1).toString(),
    ...req.body,
    status: 'pending',
    student: { name: 'John Doe', email: 'john@example.com', studentId: 'STU001' },
    createdAt: new Date().toISOString()
  };
  mockComplaints.push(newComplaint);
  res.json({
    message: 'Complaint created successfully',
    complaint: newComplaint
  });
});

app.get('/api/complaints/:id', (req, res) => {
  const complaint = mockComplaints.find(c => c._id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found' });
  }
  res.json(complaint);
});

app.get('/api/complaints/stats/overview', (req, res) => {
  res.json({
    statusStats: [
      { _id: 'pending', count: 1 },
      { _id: 'in_progress', count: 1 },
      { _id: 'resolved', count: 0 },
      { _id: 'closed', count: 0 }
    ],
    categoryStats: [
      { _id: 'water', count: 1 },
      { _id: 'internet', count: 1 },
      { _id: 'mess', count: 0 },
      { _id: 'electricity', count: 0 }
    ],
    priorityStats: [
      { _id: 'high', count: 1 },
      { _id: 'medium', count: 1 },
      { _id: 'low', count: 0 },
      { _id: 'urgent', count: 0 }
    ]
  });
});

app.get('/api/users', (req, res) => {
  res.json({
    users: [
      {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student',
        studentId: 'STU001',
        roomNumber: 'A-101',
        isActive: true
      }
    ],
    totalPages: 1,
    currentPage: 1,
    total: 1
  });
});

app.patch('/api/users/profile', (req, res) => {
  res.json({
    message: 'Profile updated successfully',
    user: {
      _id: '1',
      name: req.body.name || 'John Doe',
      email: 'john@example.com',
      role: 'student',
      studentId: 'STU001',
      roomNumber: req.body.roomNumber || 'A-101',
      phone: req.body.phone || '1234567890',
      isActive: true
    }
  });
});

app.listen(5001, () => {
  console.log('🚀 Demo server running on http://localhost:5001');
  console.log('📱 Frontend: http://localhost:3000');
  console.log('\n🎯 Demo Features:');
  console.log('   ✅ Login/Register (any credentials work)');
  console.log('   ✅ View complaints dashboard');
  console.log('   ✅ Create new complaints');
  console.log('   ✅ View complaint details');
  console.log('   ✅ Admin dashboard with statistics');
  console.log('   ✅ User management');
  console.log('   ✅ Profile management');
});
