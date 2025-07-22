import React from 'react';

const CollectorForm = () => {
  return (
    <div className="collector-form">
      <label>Service Area Address:</label>
      <textarea name="address" placeholder="Enter your service area..." />

      <label>Accepted Waste Types:</label>
      <div>
        <label><input type="checkbox" value="General" /> General</label>
        <label><input type="checkbox" value="Recyclable" /> Recyclable</label>
        <label><input type="checkbox" value="E-Waste" /> E-Waste</label>
        <label><input type="checkbox" value="Organic" /> Organic</label>
      </div>

      <label>Vehicle Details:</label>
      <input type="text" name="vehicleDetails" placeholder="e.g. Tata Ace - KA-01-AB-1234" />

      <label>Upload Identity Document:</label>
      <input type="file" name="identityDocument" />
    </div>
  );
};

export default CollectorForm;
