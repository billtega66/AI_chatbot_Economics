import React from 'react';
import { Box, Typography, Card, CardContent, CardActions, Button, Grid, Chip } from '@mui/material';
import RetirementHeader from './RetirementHeader';

const RetirementPlans = () => {
  const plans = [
    {
      title: 'Conservative Plan',
      description: 'Lower risk investments with stable but more modest returns.',
      monthlyContribution: '$850',
      estimatedReturn: '4-6%',
      risk: 'Low',
      timeHorizon: '25 years'
    },
    {
      title: 'Balanced Plan',
      description: 'Mix of investments balancing growth with reasonable risk.',
      monthlyContribution: '$750',
      estimatedReturn: '6-8%',
      risk: 'Medium',
      timeHorizon: '25 years'
    },
    {
      title: 'Aggressive Growth',
      description: 'Higher risk investments seeking maximum long-term returns.',
      monthlyContribution: '$650',
      estimatedReturn: '8-10%',
      risk: 'High',
      timeHorizon: '25 years'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <RetirementHeader />
      
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Retirement Plans
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose a plan that fits your goals and risk tolerance
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {plans.map((plan, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {plan.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {plan.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Monthly:</Typography>
                  <Typography variant="body2" fontWeight="bold">{plan.monthlyContribution}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Est. Return:</Typography>
                  <Typography variant="body2" fontWeight="bold">{plan.estimatedReturn}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Time Horizon:</Typography>
                  <Typography variant="body2" fontWeight="bold">{plan.timeHorizon}</Typography>
                </Box>
                
                <Chip 
                  label={`Risk: ${plan.risk}`} 
                  color={plan.risk === 'Low' ? 'success' : plan.risk === 'Medium' ? 'warning' : 'error'}
                  size="small"
                />
              </CardContent>
              <CardActions>
                <Button variant="contained" fullWidth>Select Plan</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RetirementPlans; 