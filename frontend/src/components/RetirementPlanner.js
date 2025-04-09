import React, { useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import RetirementHeader from './RetirementHeader';
import QuestionnaireForm from './QuestionnaireForm';
import RetirementPlan from './RetirementPlans';

const RetirementPlanner = () => {
  const [planResult, setPlanResult] = useState(null);

  return (
    <Container maxWidth="lg">
      <RetirementHeader />
      <Box sx={{ py: 3 }}>
        {!planResult ? (
          <QuestionnaireForm setPlanResult={setPlanResult} />
        ) : (
          <RetirementPlan result={planResult} />
        )}
      </Box>
    </Container>
  );
};

export default RetirementPlanner;
