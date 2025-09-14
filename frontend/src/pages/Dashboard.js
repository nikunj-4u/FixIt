import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  ReportProblem,
  CheckCircle,
  Pending,
  Assignment,
  TrendingUp,
  Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useComplaint } from '../contexts/ComplaintContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { complaints, stats, fetchComplaints, fetchStats, loading } = useComplaint();
  const navigate = useNavigate();
  const [recentComplaints, setRecentComplaints] = useState([]);

  console.log('Dashboard component rendered');
  console.log('User:', user);
  console.log('Complaints:', complaints);
  console.log('Loading:', loading);

  useEffect(() => {
    console.log('Dashboard useEffect - user:', user);
    console.log('Fetching complaints...');
    fetchComplaints({ limit: 5 });
    if (user?.role === 'admin' || user?.role === 'warden') {
      console.log('Fetching stats for admin...');
      fetchStats();
    }
  }, [fetchComplaints, fetchStats, user?.role]);

  useEffect(() => {
    setRecentComplaints(complaints.slice(0, 5));
  }, [complaints]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const statusData = stats?.statusStats?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const categoryData = stats?.categoryStats?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {user?.name}! Here's an overview of your complaints.
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ReportProblem color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Complaints
                  </Typography>
                  <Typography variant="h4">
                    {complaints.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Pending color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4">
                    {complaints.filter(c => c.status === 'pending').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    In Progress
                  </Typography>
                  <Typography variant="h4">
                    {complaints.filter(c => c.status === 'in_progress').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Resolved
                  </Typography>
                  <Typography variant="h4">
                    {complaints.filter(c => c.status === 'resolved').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Admin Charts */}
        {(user?.role === 'admin' || user?.role === 'warden') && (
          <>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Complaints by Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Complaints by Category
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </>
        )}

        {/* Recent Complaints */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Recent Complaints
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/complaints/create')}
                size="small"
              >
                New Complaint
              </Button>
            </Box>
            <List>
              {recentComplaints.map((complaint, index) => (
                <React.Fragment key={complaint._id}>
                  <ListItem
                    button
                    onClick={() => navigate(`/complaints/${complaint._id}`)}
                  >
                    <ListItemIcon>
                      <ReportProblem color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={complaint.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {complaint.description.substring(0, 100)}...
                          </Typography>
                          <Box mt={1}>
                            <Chip
                              label={complaint.status}
                              color={getStatusColor(complaint.status)}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={complaint.priority}
                              color={getPriorityColor(complaint.priority)}
                              size="small"
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentComplaints.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {recentComplaints.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No complaints yet"
                    secondary="Create your first complaint to get started"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/complaints/create')}
                fullWidth
              >
                Create New Complaint
              </Button>
              <Button
                variant="outlined"
                startIcon={<ReportProblem />}
                onClick={() => navigate('/complaints')}
                fullWidth
              >
                View All Complaints
              </Button>
              {(user?.role === 'admin' || user?.role === 'warden') && (
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  onClick={() => navigate('/admin')}
                  fullWidth
                >
                  Admin Dashboard
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
