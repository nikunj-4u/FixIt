import React, { useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  ReportProblem,
  CheckCircle,
  Pending,
  Assignment,
  People,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useComplaint } from '../contexts/ComplaintContext';

const AdminDashboard = () => {
  const { stats, fetchStats, complaints, fetchComplaints } = useComplaint();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchComplaints({ limit: 10 });
  }, [fetchStats, fetchComplaints]);

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
        Admin Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Overview of the complaint management system
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
                    {stats?.statusStats?.find(s => s._id === 'pending')?.count || 0}
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
                    {stats?.statusStats?.find(s => s._id === 'in_progress')?.count || 0}
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
                    {stats?.statusStats?.find(s => s._id === 'resolved')?.count || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                startIcon={<ReportProblem />}
                onClick={() => navigate('/admin/complaints')}
                fullWidth
              >
                Manage All Complaints
              </Button>
              <Button
                variant="outlined"
                startIcon={<People />}
                onClick={() => navigate('/admin/users')}
                fullWidth
              >
                Manage Users
              </Button>
              <Button
                variant="outlined"
                startIcon={<TrendingUp />}
                onClick={() => navigate('/admin/complaints')}
                fullWidth
              >
                View Reports
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Recent complaints and updates will appear here.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
