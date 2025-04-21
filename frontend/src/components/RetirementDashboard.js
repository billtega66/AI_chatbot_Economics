import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import RetirementGraphs from './RetirementGraphs';

const RetirementDashboard = () => {
  const navigate = useNavigate();
  const [retirementPlan, setRetirementPlan] = useState(null);
  const [basicStats, setBasicStats] = useState(null);

  useEffect(() => {
    loadRetirementPlan();
  }, []);

  const loadRetirementPlan = () => {
    try {
      const storedPlan = localStorage.getItem('retirementPlan');
      if (!storedPlan) {
        navigate('/questionnaire');
        return;
      }

      const planData = JSON.parse(storedPlan);
      if (!planData || !planData.retirement_plan) {
        navigate('/questionnaire');
        return;
      }

      setRetirementPlan(planData.retirement_plan);
      
      // Extract basic stats from the plan data
      const stats = {
        age: planData.retirement_plan.user_profile?.age || 0,
        currentSavings: planData.retirement_plan.user_profile?.current_savings || 0,
        income: planData.retirement_plan.user_profile?.income || 0,
        retirementAge: planData.retirement_plan.user_profile?.retirement_age || 0,
        retirementSavingsGoal: planData.retirement_plan.user_profile?.retirement_goal || 0,
        requiredSavingsRate: planData.retirement_plan.financial_metrics?.required_savings_rate || 0,
        currentSavingsRate: planData.retirement_plan.assumptions?.savings_rate || 0
      };
      
      setBasicStats(stats);
    } catch (error) {
      console.error('Error loading retirement plan:', error);
      navigate('/questionnaire');
    }
  };

  if (!retirementPlan || !basicStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading your retirement plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Yellow Top Bar */}
      <div className="bg-yellow-400 h-16 flex items-center px-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Retirement Planner</h1>
          <button 
            onClick={() => navigate('/questionnaire')}
            className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition-colors"
          >
            Update Plan
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Text Plan */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Current Status</h2>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-medium">Age:</span> {basicStats.age}</p>
                <p><span className="font-medium">Current Savings:</span> ${basicStats.currentSavings.toLocaleString()}</p>
                <p><span className="font-medium">Annual Income:</span> ${basicStats.income.toLocaleString()}</p>
                <p><span className="font-medium">Target Retirement Age:</span> {basicStats.retirementAge}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Retirement Goals</h2>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-medium">Retirement Savings Goal:</span> ${basicStats.retirementSavingsGoal.toLocaleString()}</p>
                <p><span className="font-medium">Current Savings Rate:</span> {(basicStats.currentSavingsRate * 100).toFixed(1)}%</p>
                <p><span className="font-medium">Required Savings Rate:</span> {(basicStats.requiredSavingsRate * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Personalized Retirement Plan</h2>
              <div className="prose max-w-none text-gray-700">
                <ReactMarkdown>{retirementPlan.plan}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Right Column - Graphs */}
          <div className="space-y-6">
            <RetirementGraphs basicStats={basicStats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirementDashboard; 