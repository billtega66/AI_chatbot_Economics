import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Divider, Chip, CircularProgress } from '@mui/material';
import RetirementHeader from './RetirementHeader';

const RetirementDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [retirementPlan, setRetirementPlan] = useState(null);
  const [basicStats, setBasicStats] = useState({
    yearsLeft: 0,
    totalSavings: 0
  });

  // Load retirement plan data when component mounts
  useEffect(() => {
    const loadRetirementPlan = () => {
      try {
        // Get stored retirement plan from local storage
        const storedPlan = localStorage.getItem('retirementPlan');
        
        if (storedPlan) {
          const planData = JSON.parse(storedPlan);
          setRetirementPlan(planData.retirement_plan?.retirement_plan || "No retirement plan was generated.");
          setBasicStats({
            yearsLeft: planData.years_left || 0,
            totalSavings: planData.total_savings || 0
          });
        }
      } catch (error) {
        console.error('Error loading retirement plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRetirementPlan();
  }, []);

  // Function to format retirement plan text with sections
  const formatPlanText = (text) => {
    if (!text) return [];
    
    // Split text by double newlines to identify sections
    const sections = text.split(/\n\n+/);
    
    return sections.map((section, index) => {
      // Check if section is a heading
      const isHeading = section.trim().match(/^[A-Z\s]{5,}:?$/);
      
      if (isHeading) {
        return <Typography key={index} variant="h6" fontWeight="bold" mt={3} mb={1}>{section}</Typography>;
      }
      
      // Check if section starts with a heading (line ending with colon)
      const lines = section.split('\n');
      if (lines[0] && lines[0].endsWith(':')) {
        return (
          <Box key={index} mt={2} mb={2}>
            <Typography variant="subtitle1" fontWeight="bold">{lines[0]}</Typography>
            <Typography variant="body1" component="div">
              {lines.slice(1).map((line, i) => (
                <React.Fragment key={i}>
                  {line.trim().startsWith('-') ? (
                    <Box component="li" ml={2} mt={0.5}>
                      {line.trim().substring(1)}
                    </Box>
                  ) : (
                    <Typography variant="body1" mt={0.5}>{line}</Typography>
                  )}
                </React.Fragment>
              ))}
            </Typography>
          </Box>
        );
      }
      
      // Regular paragraph
      return <Typography key={index} variant="body1" paragraph>{section}</Typography>;
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <RetirementHeader />
      
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Your Retirement Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your personalized retirement plan overview
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Years Until Retirement
              </Typography>
              <Typography variant="h4" color="primary">
                {basicStats.yearsLeft}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Based on your target retirement age
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Projected Retirement Savings
              </Typography>
              <Typography variant="h4" color="primary">
                ${basicStats.totalSavings.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estimated total by retirement age
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Personalized Retirement Plan
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mt: 2 }}>
              {formatPlanText(retirementPlan)}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RetirementDashboard; 