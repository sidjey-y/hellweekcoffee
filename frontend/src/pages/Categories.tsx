import React from 'react';
import { Container, Typography } from '@mui/material';

const Categories = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Categories
      </Typography>
      <Typography variant="body1">
        Manage your menu categories here
      </Typography>
    </Container>
  );
};

export default Categories;
