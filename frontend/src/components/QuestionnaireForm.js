import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  InputAdornment,
  FormLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Define API base URL with fallback
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
  maxWidth: 800,
  margin: '20px auto',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  marginBottom: theme.spacing(4),
  '& .MuiLinearProgress-bar': {
    backgroundColor: '#4CAF50',
  },
}));

const QuestionNumber = styled(Box)(({ theme }) => ({
  backgroundColor: '#FFD700',
  borderRadius: '50%',
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
}));

const QuestionnaireForm = () => {
  const navigate = useNavigate();
  // Main form data state
  const [formData, setFormData] = useState({
    age: '',
    currentSavings: '',
    gender: '',
    currentJob: '',
    income: '',
    spending: '',
    hasMortgage: '',
    mortgageAmount: '',
    mortgageTerm: '',
    downPayment: '',
    downPaymentPercent: '',
    assets: '',
    hasInsurance: '',
    insurancePayment: '',
    hasInvestment: '',
    investmentAmount: '',
    retirementAge: '',
    retirementSavingsGoal: ''
  });

  // Current question index
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Determine which questions to show based on answers
  const [totalQuestions, setTotalQuestions] = useState(15);
  
  // Update total questions whenever conditional answers change
  useEffect(() => {
    let count = 15; // base number of questions
    
    // Subtract questions that won't be shown based on answers
    if (formData.hasMortgage === 'no') {
      count -= 3;
    }
    
    if (formData.hasInsurance === 'no') {
      count -= 1;
    }
    
    if (formData.hasInvestment === 'no') {
      count -= 1;
    }
    
    setTotalQuestions(count);
  }, [formData.hasMortgage, formData.hasInsurance, formData.hasInvestment]);

  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Determine if next button should be disabled based on current question
  const isNextDisabled = () => {
    switch (currentQuestion) {
      case 0: // Age question
        return !formData.age;
      case 1: // Current savings
        return !formData.currentSavings;
      case 2: // Gender
        return !formData.gender;
      case 3: // Current job
        return !formData.currentJob;
      case 4: // Income
        return !formData.income;
      case 5: // Spending
        return !formData.spending;
      case 6: // Has mortgage
        return !formData.hasMortgage;
      case 7: // Mortgage amount (conditional)
        return formData.hasMortgage === 'yes' && !formData.mortgageAmount;
      case 8: // Mortgage term (conditional)
        return formData.hasMortgage === 'yes' && !formData.mortgageTerm;
      case 9: // Down payment (conditional)
        return formData.hasMortgage === 'yes' && (!formData.downPayment || !formData.downPaymentPercent);
      case 10: // Assets
        return !formData.assets;
      case 11: // Has insurance
        return !formData.hasInsurance;
      case 12: // Insurance payment (conditional)
        return formData.hasInsurance === 'yes' && !formData.insurancePayment;
      case 13: // Has investment
        return !formData.hasInvestment;
      case 14: // Investment amount (conditional)
        return formData.hasInvestment === 'yes' && !formData.investmentAmount;
      case 15: // Retirement age
        return !formData.retirementAge;
      case 16: // Retirement savings goal
        return !formData.retirementSavingsGoal;
      default:
        return false;
    }
  };

  // Function to handle moving to next question
  const handleNext = () => {
    // Skip questions based on conditions
    if (currentQuestion === 6 && formData.hasMortgage === 'no') {
      // Skip mortgage questions (7, 8, 9)
      setCurrentQuestion(10);
    } else if (currentQuestion === 11 && formData.hasInsurance === 'no') {
      // Skip insurance payment question (12)
      setCurrentQuestion(13);
    } else if (currentQuestion === 13 && formData.hasInvestment === 'no') {
      // Skip investment amount question (14)
      setCurrentQuestion(15);
    } else {
      // Normal progression
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Function to handle moving to previous question
  const handlePrevious = () => {
    // Handle backwards navigation with conditional questions
    if (currentQuestion === 10 && formData.hasMortgage === 'no') {
      // Jump back to mortgage question
      setCurrentQuestion(6);
    } else if (currentQuestion === 13 && formData.hasInsurance === 'no') {
      // Jump back to insurance question
      setCurrentQuestion(11);
    } else if (currentQuestion === 15 && formData.hasInvestment === 'no') {
      // Jump back to investment question
      setCurrentQuestion(13);
    } else {
      // Normal backwards progression
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Calculate actual visible question number for display
  const getDisplayQuestionNumber = () => {
    let num = currentQuestion + 1;
    
    // Adjust question number based on skipped questions
    if (formData.hasMortgage === 'no') {
      if (currentQuestion >= 10) num -= 3;
    }
    
    if (formData.hasInsurance === 'no') {
      if (currentQuestion >= 13) num -= 1;
    }
    
    if (formData.hasInvestment === 'no') {
      if (currentQuestion >= 15) num -= 1;
    }
    
    return num;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    return (getDisplayQuestionNumber() / totalQuestions) * 100;
  };

  // Render the current question
  const renderQuestion = () => {
    const displayQuestionNumber = getDisplayQuestionNumber();
    
    switch (currentQuestion) {
      case 0:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                What is your age?
              </Typography>
              <Tooltip title="Your age helps us calculate the optimal retirement strategy">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please provide accurate information for better results
            </Typography>
            <TextField
              fullWidth
              label="Enter your age"
              variant="outlined"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              sx={{ mb: 4 }}
            />
          </>
        );
      case 1:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                What is your current savings?
              </Typography>
              <Tooltip title="Your current savings will help determine your financial baseline">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Include all liquid assets such as checking, savings, and money market accounts
            </Typography>
            <TextField
              fullWidth
              label="Enter your current savings"
              variant="outlined"
              type="number"
              name="currentSavings"
              value={formData.currentSavings}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />
          </>
        );
      case 2:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                What is your gender?
              </Typography>
              <Tooltip title="Your gender helps us account for statistical factors like life expectancy">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This helps us account for statistical differences in financial planning
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 4 }}>
              <RadioGroup
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                row
              >
                <FormControlLabel value="male" control={<Radio />} label="Male" />
                <FormControlLabel value="female" control={<Radio />} label="Female" />
                <FormControlLabel value="other" control={<Radio />} label="Prefer not to say" />
              </RadioGroup>
            </FormControl>
          </>
        );
      case 3:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                What is your current job?
              </Typography>
              <Tooltip title="Your occupation helps us understand your income stability and growth potential">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This information helps us create more accurate projections
            </Typography>
            <TextField
              fullWidth
              label="Enter your job title"
              variant="outlined"
              name="currentJob"
              value={formData.currentJob}
              onChange={handleChange}
              sx={{ mb: 4 }}
            />
          </>
        );
      case 4:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                What is your annual income?
              </Typography>
              <Tooltip title="Your income is a key factor in retirement planning">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Include your gross annual income before taxes and deductions
            </Typography>
            <TextField
              fullWidth
              label="Enter your annual income"
              variant="outlined"
              type="number"
              name="income"
              value={formData.income}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />
          </>
        );
      case 5:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                What is your monthly spending?
              </Typography>
              <Tooltip title="Understanding your spending habits helps us determine how much you can save">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Include all regular monthly expenses like bills, groceries, and discretionary spending
            </Typography>
            <TextField
              fullWidth
              label="Enter your monthly spending"
              variant="outlined"
              type="number"
              name="spending"
              value={formData.spending}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />
          </>
        );
      case 6:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                Do you have a mortgage?
              </Typography>
              <Tooltip title="Mortgage information helps us understand your long-term financial obligations">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This will help us calculate your total debt obligations
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 4 }}>
              <RadioGroup
                name="hasMortgage"
                value={formData.hasMortgage}
                onChange={handleChange}
                row
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </>
        );
      case 7:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                How much are you holding in your mortgage?
              </Typography>
              <Tooltip title="This helps us calculate your debt-to-income ratio">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Enter the total remaining balance on your mortgage
            </Typography>
            <TextField
              fullWidth
              label="Enter your mortgage amount"
              variant="outlined"
              type="number"
              name="mortgageAmount"
              value={formData.mortgageAmount}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />
          </>
        );
      case 8:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                How long are you loaning it for?
              </Typography>
              <Tooltip title="This helps us understand when you'll be free of mortgage payments">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Enter the remaining years on your mortgage
            </Typography>
            <TextField
              fullWidth
              label="Enter mortgage term in years"
              variant="outlined"
              type="number"
              name="mortgageTerm"
              value={formData.mortgageTerm}
              onChange={handleChange}
              sx={{ mb: 4 }}
            />
          </>
        );
      case 9:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                How much is your down payment, and what percentage?
              </Typography>
              <Tooltip title="This helps us understand your initial equity in the property">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please provide both the amount and percentage of your down payment
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <TextField
                fullWidth
                label="Down payment amount"
                variant="outlined"
                type="number"
                name="downPayment"
                value={formData.downPayment}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Down payment percentage"
                variant="outlined"
                type="number"
                name="downPaymentPercent"
                value={formData.downPaymentPercent}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </Box>
          </>
        );
      case 10:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                How many assets are you holding?
              </Typography>
              <Tooltip title="This helps us understand your complete financial picture">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Include total value of all assets (real estate, vehicles, valuables, etc.)
            </Typography>
            <TextField
              fullWidth
              label="Enter total asset value"
              variant="outlined"
              type="number"
              name="assets"
              value={formData.assets}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />
          </>
        );
      case 11:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                Do you have any insurance?
              </Typography>
              <Tooltip title="Insurance is an important part of financial planning">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This includes life, health, disability, or other insurance types
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 4 }}>
              <RadioGroup
                name="hasInsurance"
                value={formData.hasInsurance}
                onChange={handleChange}
                row
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </>
        );
      case 12:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                How much do you pay for your insurance?
              </Typography>
              <Tooltip title="Insurance premiums are an ongoing expense to factor into your planning">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Enter your total monthly insurance payments
            </Typography>
            <TextField
              fullWidth
              label="Enter monthly insurance payment"
              variant="outlined"
              type="number"
              name="insurancePayment"
              value={formData.insurancePayment}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />
          </>
        );
      case 13:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                Do you have any investment?
              </Typography>
              <Tooltip title="Investments can significantly impact your retirement savings">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This includes stocks, bonds, mutual funds, 401(k), IRA, etc.
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 4 }}>
              <RadioGroup
                name="hasInvestment"
                value={formData.hasInvestment}
                onChange={handleChange}
                row
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </>
        );
      case 14:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                How much do you hold in your investment?
              </Typography>
              <Tooltip title="Understanding your current investments helps us build on your existing strategy">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Enter the total value of all your investment accounts
            </Typography>
            <TextField
              fullWidth
              label="Enter total investment value"
              variant="outlined"
              type="number"
              name="investmentAmount"
              value={formData.investmentAmount}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />
          </>
        );
      case 15:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                What is the age you wish to retire?
              </Typography>
              <Tooltip title="Your target retirement age is essential for calculating your savings timeline">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This will help us determine how long you have to save
            </Typography>
            <TextField
              fullWidth
              label="Enter your desired retirement age"
              variant="outlined"
              type="number"
              name="retirementAge"
              value={formData.retirementAge}
              onChange={handleChange}
              sx={{ mb: 4 }}
            />
          </>
        );
      case 16:
        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight="medium">
                How much do you want to save for your retirement?
              </Typography>
              <Tooltip title="Your retirement savings goal helps us craft the right plan for you">
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This is the total amount you'd like to have saved by retirement
            </Typography>
            <TextField
              fullWidth
              label="Enter your retirement savings goal"
              variant="outlined"
              type="number"
              name="retirementSavingsGoal"
              value={formData.retirementSavingsGoal}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />
          </>
        );
      default:
        return <Typography>Form completed!</Typography>;
    }
  };

  // Function to submit data to the backend
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting form data:', formData);
      
      // Validate required fields
      const requiredFields = ['age', 'currentSavings', 'income', 'retirementAge', 'retirementSavingsGoal'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      const response = await axios.post(`${API_BASE_URL}/retirement/plan`, formData);
      console.log('Response received:', response.data);
      
      if (response.data && response.data.retirement_plan) {
        // Store the retirement plan in local storage
        localStorage.setItem('retirementPlan', JSON.stringify(response.data));
        console.log('Plan stored in localStorage:', response.data);
        
        // Navigate to the results page
        navigate('/retirement/dashboard');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'There was an error generating your retirement plan. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  return (
    <StyledPaper elevation={2}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Question {getDisplayQuestionNumber()} of {totalQuestions}
        </Typography>
        <ProgressBar variant="determinate" value={calculateProgress()} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        <QuestionNumber>
          <Typography variant="subtitle1" fontWeight="bold">{getDisplayQuestionNumber()}</Typography>
        </QuestionNumber>
        <Box sx={{ flexGrow: 1 }}>
          {renderQuestion()}
        </Box>
      </Box>

      {error && (
        <Box sx={{ color: 'error.main', mt: 2, mb: 2 }}>
          <Typography>{error}</Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          color="inherit"
          disabled={currentQuestion === 0 || isSubmitting}
          startIcon={<ArrowBackIcon />}
          onClick={handlePrevious}
        >
          Previous
        </Button>
        {currentQuestion < 16 ? (
          <Button
            variant="contained"
            color="primary"
            disabled={isNextDisabled()}
            endIcon={<ArrowForwardIcon />}
            onClick={handleNext}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            disabled={isNextDisabled() || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Generating Plan...' : 'Submit'}
          </Button>
        )}
      </Box>
    </StyledPaper>
  );
};

export default QuestionnaireForm; 