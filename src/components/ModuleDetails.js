import React from 'react';

const ModuleDetails = ({ module }) => {
  return (
    <div className="module-details">
      <h2>{module.title}</h2>
      <p>{module.description}</p>
      {/* Additional details and functionality can go here */}
    </div>
  );
};

export default ModuleDetails;
