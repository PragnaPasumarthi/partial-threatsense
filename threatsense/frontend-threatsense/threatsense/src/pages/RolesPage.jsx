import React from 'react';

const RolesPage = () => {
  const roles = [
    { name: 'Owner', permissions: 'Full system access', users: 1 },
    { name: 'Finance', permissions: 'Financial data access', users: 5 },
    { name: 'Sales', permissions: 'CRM and customer data', users: 12 },
    { name: 'HR', permissions: 'Employee records', users: 3 },
    { name: 'Support', permissions: 'Ticket management', users: 8 }
  ];

  return (
    <div className="page-container">
      <h1 className="page-header">Role Management</h1>
      <div className="card-grid">
        {roles.map((role, i) => (
          <div key={i} className="card">
            <h3 style={{ color: '#3b82f6', marginBottom: '0.75rem', fontSize: '1.25rem' }}>{role.name}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.75rem', flex: 1 }}>{role.permissions}</p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 'auto' }}>{role.users} users</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolesPage;
