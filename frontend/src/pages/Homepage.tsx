import React from 'react';
import { Container, Typography, Box, Button, Paper, Grid, Card, CardContent, CardMedia, CardActionArea } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const newsItems = [
  {
    id: 1,
    title: "New Holiday Drinks Are Here!",
    description: "Celebrate the season with our new festive drinks collection. Try our Peppermint Mocha, Toffee Nut Latte, and more!",
    image: "/images/holiday-drinks.jpg",
    date: "December 1, 2024"
  },
  {
    id: 2,
    title: "Introducing Our Rewards Program",
    description: "Earn points with every purchase and enjoy exclusive member benefits. Sign up today!",
    image: "/images/rewards.jpg",
    date: "November 25, 2024"
  },
  {
    id: 3,
    title: "New Branch Opening Soon!",
    description: "We're expanding! Visit our new branch at UP Town Center opening this January 2025.",
    image: "/images/new-branch.jpg",
    date: "November 15, 2024"
  }
];

const Homepage = () => {
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          mt: 8,
          mb: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 4,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to HellWeek Coffee
        </Typography>

        <Typography variant="h5" color="text.secondary" paragraph>
          Your perfect cup of coffee, even during hell week!
        </Typography>

        <Typography variant="body1" paragraph sx={{ maxWidth: 600 }}>
          At HellWeek Coffee, we understand the struggles of long study sessions and demanding projects.
          That's why we're here to fuel your success with our carefully crafted coffee selections and
          a welcoming atmosphere.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            color="primary"
            size="large"
          >
            Join Us Today
          </Button>
          <Button
            component={RouterLink}
            to="/about"
            variant="outlined"
            color="primary"
            size="large"
          >
            Learn More
          </Button>
        </Box>
      </Box>

      {/* News Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Latest News
        </Typography>
        <Grid container spacing={4}>
          {newsItems.map((news) => (
            <Grid item xs={12} md={4} key={news.id}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="200"
                    image={news.image}
                    alt={news.title}
                    sx={{
                      // Placeholder background if image fails to load
                      backgroundColor: 'grey.300'
                    }}
                  />
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">
                      {news.date}
                    </Typography>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {news.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {news.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Homepage;
