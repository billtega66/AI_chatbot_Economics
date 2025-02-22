import React from 'react';

const ModuleCard = ({ module, onClick }) => {
  return (
    <div className="module-card" onClick={onClick}>
      <module.icon className="module-icon" />
      <h2 className="module-title">{module.title}</h2>
      <p className="module-description">{module.description}</p>
    </div>
  );
};

export default ModuleCard;
