import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Button, Alert } from '@mui/material';
import axios from 'axios';

const TestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Test API Base URL',
        test: async () => {
          console.log('Current axios baseURL:', axios.defaults.baseURL);
          return `Base URL: ${axios.defaults.baseURL}`;
        }
      },
      {
        name: 'Test Categories API',
        test: async () => {
          const response = await axios.get('/api/categories');
          return `Categories loaded: ${response.data.length} items`;
        }
      },
      {
        name: 'Test Complaints API',
        test: async () => {
          const response = await axios.get('/api/complaints');
          return `Complaints loaded: ${response.data.complaints.length} items`;
        }
      },
      {
        name: 'Test Login API',
        test: async () => {
          const response = await axios.post('/api/auth/login', { 
            email: 'test@example.com', 
            password: 'password' 
          });
          return `Login successful: ${response.data.user.name}`;
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        setTestResults(prev => [...prev, { name: test.name, status: 'success', result }]);
      } catch (error) {
        setTestResults(prev => [...prev, { 
          name: test.name, 
          status: 'error', 
          result: error.message 
        }]);
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    // Set the base URL
    axios.defaults.baseURL = 'http://localhost:5001';
    console.log('Test page - API base URL set to:', axios.defaults.baseURL);
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          FixIT API Test Page
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          This page tests the API connection and helps debug issues.
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={runTests}
            disabled={loading}
            sx={{ mb: 3 }}
          >
            {loading ? 'Running Tests...' : 'Run API Tests'}
          </Button>

          {testResults.map((test, index) => (
            <Alert
              key={index}
              severity={test.status === 'success' ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              <Typography variant="subtitle2">
                {test.name}: {test.result}
              </Typography>
            </Alert>
          ))}
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Debug Information:
          </Typography>
          <Typography variant="body2">
            • Frontend URL: {window.location.origin}
          </Typography>
          <Typography variant="body2">
            • API Base URL: {axios.defaults.baseURL}
          </Typography>
          <Typography variant="body2">
            • User Agent: {navigator.userAgent}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TestPage;
