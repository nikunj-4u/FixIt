import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Grid,
  Divider,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Comment as CommentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useComplaint } from '../contexts/ComplaintContext';
import { useAuth } from '../contexts/AuthContext';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addComment, updateComplaintStatus, assignComplaint } = useComplaint();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setComplaint(data);
    } catch (error) {
      console.error('Error fetching complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    setSubmittingComment(true);
    const result = await addComment(id, comment);
    if (result.success) {
      setComplaint(result.complaint);
      setComment('');
    }
    setSubmittingComment(false);
  };

  const handleStatusUpdate = async () => {
    const result = await updateComplaintStatus(id, statusUpdate, resolution);
    if (result.success) {
      setComplaint(result.complaint);
      setStatusUpdate('');
      setResolution('');
    }
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!complaint) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Complaint not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/complaints')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Complaint Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h5" gutterBottom>
                {complaint.title}
              </Typography>
              <Box display="flex" gap={1}>
                <Chip
                  label={complaint.status.replace('_', ' ').toUpperCase()}
                  color={getStatusColor(complaint.status)}
                />
                <Chip
                  label={complaint.priority.toUpperCase()}
                  color={getPriorityColor(complaint.priority)}
                />
              </Box>
            </Box>

            <Typography variant="body1" paragraph>
              {complaint.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1">
                  {complaint.category.replace('_', ' ').toUpperCase()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Room Number
                </Typography>
                <Typography variant="body1">
                  {complaint.roomNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {formatDate(complaint.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {formatDate(complaint.updatedAt)}
                </Typography>
              </Grid>
            </Grid>

            {complaint.resolution && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Resolution
                </Typography>
                <Typography variant="body1">
                  {complaint.resolution}
                </Typography>
                {complaint.resolvedAt && (
                  <Typography variant="caption" color="text.secondary">
                    Resolved on {formatDate(complaint.resolvedAt)}
                  </Typography>
                )}
              </>
            )}
          </Paper>

          {/* Comments Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Comments ({complaint.comments?.length || 0})
            </Typography>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={submittingComment || !comment.trim()}
                startIcon={<CommentIcon />}
              >
                {submittingComment ? <CircularProgress size={20} /> : 'Add Comment'}
              </Button>
            </Box>

            <List>
              {complaint.comments?.map((comment, index) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      {comment.user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">
                          {comment.user?.name}
                        </Typography>
                        <Chip
                          label={comment.user?.role}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {comment.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(comment.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              {(!complaint.comments || complaint.comments.length === 0) && (
                <ListItem>
                  <ListItemText
                    primary="No comments yet"
                    secondary="Be the first to comment on this complaint"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Student Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Student Information
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="subtitle2">
                    {complaint.student?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {complaint.student?.email}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Student ID: {complaint.student?.studentId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Room: {complaint.student?.roomNumber}
              </Typography>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          {(user?.role === 'admin' || user?.role === 'warden') && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Admin Actions
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    select
                    label="Update Status"
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    sx={{ mb: 1 }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </TextField>
                  
                  {statusUpdate === 'resolved' && (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Resolution Details"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      sx={{ mb: 1 }}
                    />
                  )}
                  
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleStatusUpdate}
                    disabled={!statusUpdate}
                  >
                    Update Status
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ComplaintDetails;
