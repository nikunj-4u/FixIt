import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const SimpleTest = () => {
  console.log('SimpleTest component rendered');
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Simple Test Component
        </Typography>
        <Typography variant="body1">
          If you can see this, the routing is working!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Current time: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Container>
  );
};

export default SimpleTest;
