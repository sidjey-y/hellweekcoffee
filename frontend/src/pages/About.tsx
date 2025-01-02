import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const About: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          About HellWeek Coffee
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" paragraph>
            Welcome to HellWeek Coffee, your perfect companion during those intense study sessions 
            and late-night coding marathons. We understand that sometimes you need more than just 
            coffee – you need a place that gets you.
          </Typography>
          <Typography variant="body1" paragraph>
            Our coffee shop was founded by students who lived through their own hell weeks and 
            wanted to create a space where fellow students could find comfort, caffeine, and 
            community. We pride ourselves on serving high-quality coffee and providing a 
            welcoming atmosphere for everyone.
          </Typography>
          <Typography variant="body1" paragraph>
            Whether you're cramming for finals, working on a group project, or just need a 
            quiet place to study, HellWeek Coffee is here for you. Our menu is crafted to 
            keep you energized and focused, with options for every taste and dietary preference.
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            To provide a comfortable and productive environment for students, powered by 
            great coffee and understanding service. We aim to be more than just a coffee shop – 
            we want to be your second home during those challenging academic times.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default About;
