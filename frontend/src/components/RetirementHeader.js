import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const RetirementHeader = () => {
  return (
    <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: 'white', borderRadius: '8px' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/retirement"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Retirement Planner
          <Typography
            variant="caption"
            sx={{
              backgroundColor: '#f0f0f0',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.7rem'
            }}
          >
            Beta
          </Typography>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/retirement/dashboard"
            color="inherit"
          >
            Dashboard
          </Button>
          <Button
            component={Link}
            to="/retirement/plans"
            color="inherit"
          >
            Plans
          </Button>
          <Button
            component={Link}
            to="/retirement/resources"
            color="inherit"
          >
            Resources
          </Button>
          <IconButton color="inherit">
            <AccountCircleIcon />
            <KeyboardArrowDownIcon fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default RetirementHeader; 