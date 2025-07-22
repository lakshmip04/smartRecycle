import React, { useState } from 'react';
import HouseholdForm from './HouseholdForm';
import CollectorForm from './CollectorForm';
import './Register.css';

const Register = () => {
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="register-container">
      <h2>Register</h2>

      <div className="role-selector">
        <label>
          <input
            type="radio"
            name="role"
            value="HOUSEHOLD"
            checked={role === 'HOUSEHOLD'}
            onChange={() => setRole('HOUSEHOLD')}
          />
          I want to dispose of waste
        </label>

        <label>
          <input
            type="radio"
            name="role"
            value="COLLECTOR"
            checked={role === 'COLLECTOR'}
            onChange={() => setRole('COLLECTOR')}
          />
          I am a waste collector
        </label>
      </div>

      <div className="common-fields">
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} />
        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} />
        <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} />
      </div>

      {role === 'HOUSEHOLD' && <HouseholdForm />}
      {role === 'COLLECTOR' && <CollectorForm />}
    </div>
  );
};

export default Register;
