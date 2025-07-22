import React from 'react';

const HouseholdForm = () => {
  return (
    <div className="household-form">
      <label>Date of Birth:</label>
      <input type="date" name="dateOfBirth" />

      <label>Home Address:</label>
      <textarea name="address" placeholder="Enter your full address..." />
    </div>
  );
};

export default HouseholdForm;
