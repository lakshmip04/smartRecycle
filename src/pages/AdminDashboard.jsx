// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // Optional: for custom styling

axios.defaults.baseURL = 'http://localhost:5000'; // or your backend URL
axios.defaults.withCredentials = true; // if using cookies/JWT

const AdminDashboard = () => {
  const [view, setView] = useState('overview');
  const [stats, setStats] = useState({ users: 0, collectors: 0, pickups: 0 });
  const [users, setUsers] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [classificationData, setClassificationData] = useState({ bio: 0, nonbio: 0 });

  useEffect(() => {
    // No backend yet – use mock data
    setStats({ users: 5, collectors: 2, pickups: 10 });

    setUsers([
      {
        _id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        location: 'Zone A',
        isApproved: false,
      },
      {
        _id: '2',
        name: 'Bob',
        email: 'bob@example.com',
        location: 'Zone B',
        isApproved: true,
      },
    ]);

    setCollectors([
      {
        _id: 'c1',
        name: 'Charlie',
        email: 'charlie@example.com',
        area: 'Area 1',
        vehicleNumber: 'TN01AB1234',
        isApproved: true,
      },
      {
        _id: 'c2',
        name: 'Dave',
        email: 'dave@example.com',
        area: 'Area 2',
        vehicleNumber: 'TN09XY9876',
        isApproved: false,
      },
    ]);

    setClassificationData({ bio: 8, nonbio: 5 });
  }, []);

  const fetchStats = async () => {
    const res = await axios.get('/api/admin/stats');
    setStats(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get('/api/admin/users');
    setUsers(res.data);
  };

  const fetchCollectors = async () => {
    const res = await axios.get('/api/admin/collectors');
    setCollectors(res.data);
  };

  const fetchClassificationData = async () => {
    const res = await axios.get('/api/admin/classification-logs');
    setClassificationData(res.data);
  };

  const approveUser = (id) => {
    console.log('Approved user', id);
    setUsers(users.map(user => 
      user._id === id ? { ...user, isApproved: true } : user
    ));
  };

  const deleteUser = (id) => {
    console.log('Deleted user', id);
    setUsers(users.filter(user => user._id !== id));
  };

  const approveCollector = async (id) => {
    console.log('Approved collector', id);
    setCollectors(collectors.map(collector => 
      collector._id === id ? { ...collector, isApproved: true } : collector
    ));
  };

  const deleteCollector = async (id) => {
    console.log('Deleted collector', id);
    setCollectors(collectors.filter(collector => collector._id !== id));
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h3 style={{ color: '#fff', marginBottom: '20px' }}>EcoDrop Admin</h3>
        <button onClick={() => setView('overview')}>Overview</button>
        <button onClick={() => setView('users')}>Users</button>
        <button onClick={() => setView('collectors')}>Collectors</button>
        <button onClick={() => setView('classification')}>AI Classification</button>
        <button onClick={() => window.location.href = '/login'} style={{ marginTop: '20px', background: '#d32f2f' }}>
          Logout
        </button>
      </aside>

      <main className="dashboard-content">
        {view === 'overview' && (
          <div>
            <h2>Dashboard Overview</h2>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', flex: 1 }}>
                <h3>Total Users</h3>
                <p style={{ fontSize: '2rem', color: '#4CAF50', margin: 0 }}>{stats.users}</p>
              </div>
              <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', flex: 1 }}>
                <h3>Total Waste Collectors</h3>
                <p style={{ fontSize: '2rem', color: '#4CAF50', margin: 0 }}>{stats.collectors}</p>
              </div>
              <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', flex: 1 }}>
                <h3>Total Pickup Requests</h3>
                <p style={{ fontSize: '2rem', color: '#4CAF50', margin: 0 }}>{stats.pickups}</p>
              </div>
            </div>
          </div>
        )}

        {view === 'users' && (
          <div>
            <h2>User Management</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Location</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.location}</td>
                    <td>
                      <span style={{ 
                        color: user.isApproved ? '#4CAF50' : '#FF9800',
                        fontWeight: 'bold'
                      }}>
                        {user.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!user.isApproved && (
                        <button 
                          onClick={() => approveUser(user._id)}
                          style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
                        >
                          Approve
                        </button>
                      )}
                      <button 
                        onClick={() => deleteUser(user._id)}
                        style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'collectors' && (
          <div>
            <h2>Waste Collector Management</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Area</th><th>Vehicle</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {collectors.map(col => (
                  <tr key={col._id}>
                    <td>{col.name}</td>
                    <td>{col.email}</td>
                    <td>{col.area}</td>
                    <td>{col.vehicleNumber}</td>
                    <td>
                      <span style={{ 
                        color: col.isApproved ? '#4CAF50' : '#FF9800',
                        fontWeight: 'bold'
                      }}>
                        {col.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!col.isApproved && (
                        <button 
                          onClick={() => approveCollector(col._id)}
                          style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
                        >
                          Approve
                        </button>
                      )}
                      <button 
                        onClick={() => deleteCollector(col._id)}
                        style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'classification' && (
          <div>
            <h2>AI Classification Stats</h2>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <div style={{ background: '#e8f5e8', padding: '20px', borderRadius: '8px', flex: 1 }}>
                <h3>Biodegradable Materials</h3>
                <p style={{ fontSize: '2rem', color: '#4CAF50', margin: 0 }}>{classificationData.bio}</p>
              </div>
              <div style={{ background: '#ffeaa7', padding: '20px', borderRadius: '8px', flex: 1 }}>
                <h3>Non-Biodegradable Materials</h3>
                <p style={{ fontSize: '2rem', color: '#FF9800', margin: 0 }}>{classificationData.nonbio}</p>
              </div>
            </div>
            <div style={{ marginTop: '30px' }}>
              <h3>Classification Accuracy</h3>
              <p>Current AI model accuracy: <strong>94.2%</strong></p>
              <p>Total materials classified: <strong>{classificationData.bio + classificationData.nonbio}</strong></p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard; 