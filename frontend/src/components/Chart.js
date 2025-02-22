import React from 'react';
import { Line } from 'react-chartjs-2';

const Chart = ({ data, options }) => {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Economic Trends',
        data: [30, 50, 70, 90, 110],
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return <Line data={data || chartData} options={options || chartOptions} />;
};

export default Chart;
