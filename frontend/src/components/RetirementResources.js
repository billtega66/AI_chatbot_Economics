import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, Paper, Link } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalculateIcon from '@mui/icons-material/Calculate';
import HelpIcon from '@mui/icons-material/Help';
import RetirementHeader from './RetirementHeader';

const RetirementResources = () => {
  const articles = [
    {
      title: "Understanding Inflation's Impact on Retirement",
      description: "Learn how inflation can affect your retirement savings and strategies to combat it.",
      link: "#"
    },
    {
      title: "The Power of Compound Interest",
      description: "Discover how compound interest works and why starting early is crucial for retirement.",
      link: "#"
    },
    {
      title: "Diversification: Spreading Your Investment Risk",
      description: "Learn why diversification is essential for a balanced retirement portfolio.",
      link: "#"
    }
  ];

  const tools = [
    {
      title: "Retirement Calculator",
      description: "Estimate how much you need to save for retirement",
      link: "#"
    },
    {
      title: "Social Security Estimator",
      description: "Calculate your expected Social Security benefits",
      link: "#"
    },
    {
      title: "Investment Risk Assessment",
      description: "Determine your risk tolerance for retirement investments",
      link: "#"
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <RetirementHeader />
      
      <Box sx={{ mt: 4, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Retirement Resources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Educational materials and tools to help you plan for retirement
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <ArticleIcon sx={{ mr: 1 }} />
          Educational Articles
        </Typography>
        <List>
          {articles.map((article, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Link href={article.link} underline="hover" color="primary">
                      {article.title}
                    </Link>
                  }
                  secondary={article.description}
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <CalculateIcon sx={{ mr: 1 }} />
          Retirement Tools
        </Typography>
        <List>
          {tools.map((tool, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Link href={tool.link} underline="hover" color="primary">
                      {tool.title}
                    </Link>
                  }
                  secondary={tool.description}
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <HelpIcon sx={{ mr: 1 }} />
          Retirement Glossary
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Inflation"
              secondary="The rate at which the general level of prices for goods and services is rising, eroding purchasing power."
            />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText
              primary="Interest Rate"
              secondary="The percentage charged on a loan or paid on savings over a specific period."
            />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText
              primary="Diversification"
              secondary="A risk management strategy that mixes a wide variety of investments within a portfolio."
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default RetirementResources; 