import React from 'react';
import { Container, Typography } from '@mui/material';

const Customers = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Customers
      </Typography>
      <Typography variant="body1">
        Manage your customers here
      </Typography>
    </Container>
  );
};

export default Customers;
