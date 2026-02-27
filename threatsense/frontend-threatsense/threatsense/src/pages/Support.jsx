import React, { useState, useEffect } from 'react';
import './Support.css';

const Support = () => {
  const [data, setData] = useState({
    tasks: [],
    workflow: { pending: [], inProgress: [], resolved: [] },
    appointments: []
  });

  useEffect(() => {
    const tasks = [
      { taskId: 'TSK-1024', client: 'Acme Corp', priority: 'High', scheduledTime: '10:00 AM', assignedTo: 'Sarah Chen' },
      { taskId: 'TSK-1025', client: 'TechStart Inc', priority: 'Medium', scheduledTime: '11:30 AM', assignedTo: 'Mike Torres' },
      { taskId: 'TSK-1026', client: 'Global Systems', priority: 'Low', scheduledTime: '02:00 PM', assignedTo: 'Emma Wilson' },
      { taskId: 'TSK-1027', client: 'DataFlow Ltd', priority: 'High', scheduledTime: '09:15 AM', assignedTo: 'James Park' },
      { taskId: 'TSK-1028', client: 'CloudNet Co', priority: 'Medium', scheduledTime: '03:45 PM', assignedTo: 'Lisa Kumar' }
    ];

    const workflow = {
      pending: [
        { caseId: 'CASE-5421', client: 'Acme Corp', assignedAgent: 'Sarah Chen', lastUpdate: '2 hours ago' },
        { caseId: 'CASE-5422', client: 'TechStart Inc', assignedAgent: 'Mike Torres', lastUpdate: '45 mins ago' }
      ],
      inProgress: [
        { caseId: 'CASE-5418', client: 'Global Systems', assignedAgent: 'Emma Wilson', lastUpdate: '15 mins ago' },
        { caseId: 'CASE-5419', client: 'DataFlow Ltd', assignedAgent: 'James Park', lastUpdate: '1 hour ago' }
      ],
      resolved: [
        { caseId: 'CASE-5415', client: 'CloudNet Co', assignedAgent: 'Lisa Kumar', lastUpdate: '3 hours ago' },
        { caseId: 'CASE-5416', client: 'NetSolutions', assignedAgent: 'Sarah Chen', lastUpdate: '5 hours ago' }
      ]
    };

    const appointments = [
      { id: 'APT-2401', client: 'Acme Corp', dealTitle: 'Enterprise Security Suite', assignedTo: 'Sarah Chen', date: '2024-01-15', time: '10:00 AM' },
      { id: 'APT-2402', client: 'TechStart Inc', dealTitle: 'Cloud Migration Package', assignedTo: 'Mike Torres', date: '2024-01-14', time: '02:30 PM' },
      { id: 'APT-2403', client: 'Global Systems', dealTitle: 'SOC Integration', assignedTo: 'Emma Wilson', date: '2024-01-16', time: '11:00 AM' },
      { id: 'APT-2404', client: 'DataFlow Ltd', dealTitle: 'Compliance Audit', assignedTo: 'James Park', date: '2024-01-13', time: '09:00 AM' },
      { id: 'APT-2405', client: 'CloudNet Co', dealTitle: 'Threat Intelligence Feed', assignedTo: 'Lisa Kumar', date: '2024-01-17', time: '03:00 PM' }
    ];

    setData({ tasks, workflow, appointments });
  }, []);

  return (
    <div className="support-workflow">
      <div className="workflow-header">
        <div className="header-info">
          <h1>Support Workflow & Coordination</h1>
          <div className="header-meta">
            <span className="agent-name">Agent: Sarah Chen</span>
            <span className="shift-status">Shift: Day (9AM - 5PM)</span>
            <span className="monitoring-status">Monitoring: Active</span>
          </div>
        </div>
      </div>

      <section className="panel">
        <h2>Task Scheduling</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Client</th>
                <th>Priority</th>
                <th>Scheduled Time</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {data.tasks.map(task => (
                <tr key={task.taskId}>
                  <td className="task-id">{task.taskId}</td>
                  <td>{task.client}</td>
                  <td><span className={`priority-tag priority-${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                  <td>{task.scheduledTime}</td>
                  <td>{task.assignedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>Workflow Coordination</h2>
        <div className="workflow-board">
          <div className="workflow-column">
            <h3>Pending</h3>
            {data.workflow.pending.map(item => (
              <div key={item.caseId} className="workflow-card">
                <div className="card-id">{item.caseId}</div>
                <div className="card-client">{item.client}</div>
                <div className="card-agent">{item.assignedAgent}</div>
                <div className="card-update">{item.lastUpdate}</div>
              </div>
            ))}
          </div>
          <div className="workflow-column">
            <h3>In Progress</h3>
            {data.workflow.inProgress.map(item => (
              <div key={item.caseId} className="workflow-card">
                <div className="card-id">{item.caseId}</div>
                <div className="card-client">{item.client}</div>
                <div className="card-agent">{item.assignedAgent}</div>
                <div className="card-update">{item.lastUpdate}</div>
              </div>
            ))}
          </div>
          <div className="workflow-column">
            <h3>Resolved</h3>
            {data.workflow.resolved.map(item => (
              <div key={item.caseId} className="workflow-card">
                <div className="card-id">{item.caseId}</div>
                <div className="card-client">{item.client}</div>
                <div className="card-agent">{item.assignedAgent}</div>
                <div className="card-update">{item.lastUpdate}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Deal Appointment Management</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Client Name</th>
                <th>Deal Title</th>
                <th>Assigned Executive</th>
                <th>Appointment Date</th>
                <th>Appointment Time</th>
              </tr>
            </thead>
            <tbody>
              {data.appointments.map(apt => (
                <tr key={apt.id}>
                  <td className="apt-id">{apt.id}</td>
                  <td>{apt.client}</td>
                  <td>{apt.dealTitle}</td>
                  <td>{apt.assignedTo}</td>
                  <td>{apt.date}</td>
                  <td>{apt.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Support;
