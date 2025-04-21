import React from 'react';
import { Box, Typography, Card, CardContent, CardActions, Button, Grid, Chip } from '@mui/material';
import RetirementHeader from './RetirementHeader';
import ReactMarkdown from 'react-markdown';

const RetirementPlans = () => {
  const saved = localStorage.getItem('retirementPlan');
  const result = saved ? JSON.parse(saved) : null;

  return (
    <Box sx={{ p: 3 }}>
      <RetirementHeader />
      {result?.retirement_plan?.plan ? (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" fontWeight="bold">📄 Your Personalized Retirement Plan</Typography>
          <Box sx={{ mt: 2 }}>
            <ReactMarkdown>{result.retirement_plan.plan}</ReactMarkdown>
          </Box>
        </Box>
      ) : (
        <Typography color="text.secondary" sx={{ mt: 4 }}>
          No retirement plan found. Please fill out the questionnaire.
        </Typography>
      )}

      
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Retirement Plans
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose a plan that fits your goals and risk tolerance
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {plans.map((plan, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
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