import React from 'react';
import Support from './Support';
import Sales from './Sales';
import HR from './HR';

const DepartmentPage = ({ title }) => (
  <div style={{ padding: '2rem', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
      {title}
    </h1>
    <p style={{ color: '#94a3b8' }}>Department monitoring and analytics will appear here.</p>
  </div>
);

export const Owner = () => <DepartmentPage title="Owner Department" />;
export const Finance = () => <DepartmentPage title="Finance Department" />;
export { Sales };
export { HR };
export { Support };
