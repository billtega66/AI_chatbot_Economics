import React, { useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RetirementGraphs = ({ basicStats }) => {
  const chartRef = useRef(null);

  // Add null check for basicStats
  if (!basicStats) {
    return (
      <div className="p-4 text-center">
        <p>Loading retirement data...</p>
      </div>
    );
  }

  // Add null checks for required properties
  const {
    age = 0,
    currentSavings = 0,
    income = 0,
    retirementAge = 0,
    retirementSavingsGoal = 0,
    requiredSavingsRate = 0,
    currentSavingsRate = 0
  } = basicStats;

  // Age-based benchmarks
  const ageBenchmarks = {
    30: 1.0,
    35: 2.0,
    40: 3.0,
    45: 4.0,
    50: 6.0,
    55: 7.0,
    60: 8.0,
    65: 10.0
  };

  const incomeBenchmarks = {
    30: 50000,
    35: 65000,
    40: 80000,
    45: 95000,
    50: 110000,
    55: 125000,
    60: 140000,
    65: 155000
  };

  const savingsRateBenchmarks = {
    30: 0.15,
    35: 0.20,
    40: 0.25,
    45: 0.30,
    50: 0.35,
    55: 0.40,
    60: 0.45,
    65: 0.50
  };

  // Prepare data for savings comparison graph
  const prepareSavingsComparisonData = () => {
    const benchmarkAge = Math.min(...Object.keys(ageBenchmarks).map(Number).filter(a => a >= age));
    const benchmarkMultiplier = ageBenchmarks[benchmarkAge];
    const benchmarkSavings = income * benchmarkMultiplier;

    return {
      labels: ['Your Savings', 'Average Savings'],
      datasets: [
        {
          label: 'Savings Amount',
          data: [currentSavings, benchmarkSavings],
          backgroundColor: ['#4CAF50', '#2196F3'],
          borderColor: ['#388E3C', '#1976D2'],
          borderWidth: 1
        }
      ]
    };
  };

  // Prepare data for income comparison graph
  const prepareIncomeComparisonData = () => {
    const benchmarkAge = Math.min(...Object.keys(incomeBenchmarks).map(Number).filter(a => a >= age));
    const benchmarkIncome = incomeBenchmarks[benchmarkAge];

    return {
      labels: ['Your Income', 'Average Income'],
      datasets: [
        {
          label: 'Income Amount',
          data: [income, benchmarkIncome],
          backgroundColor: ['#FF9800', '#9C27B0'],
          borderColor: ['#F57C00', '#7B1FA2'],
          borderWidth: 1
        }
      ]
    };
  };

  // Prepare data for savings rate comparison graph
  const prepareSavingsRateData = () => {
    const benchmarkAge = Math.min(...Object.keys(savingsRateBenchmarks).map(Number).filter(a => a >= age));
    const benchmarkRate = savingsRateBenchmarks[benchmarkAge];

    return {
      labels: ['Your Rate', 'Required Rate', 'Recommended Rate'],
      datasets: [
        {
          label: 'Savings Rate',
          data: [currentSavingsRate, requiredSavingsRate, benchmarkRate],
          backgroundColor: ['#FF5722', '#E91E63', '#009688'],
          borderColor: ['#E64A19', '#C2185B', '#00796B'],
          borderWidth: 1
        }
      ]
    };
  };

  const savingsComparisonData = prepareSavingsComparisonData();
  const incomeComparisonData = prepareIncomeComparisonData();
  const savingsRateData = prepareSavingsRateData();

  const comparisonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Savings Comparison by Age'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  const incomeOptions = {
    ...comparisonOptions,
    plugins: {
      ...comparisonOptions.plugins,
      title: {
        display: true,
        text: 'Income Comparison by Age'
      }
    }
  };

  const savingsRateOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Savings Rate Comparison'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Savings Comparison</h3>
        <Bar data={savingsComparisonData} options={comparisonOptions} />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Income Comparison</h3>
        <Bar data={incomeComparisonData} options={incomeOptions} />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Savings Rate Comparison</h3>
        <Bar data={savingsRateData} options={savingsRateOptions} />
      </div>
    </div>
  );
};

export default RetirementGraphs; 