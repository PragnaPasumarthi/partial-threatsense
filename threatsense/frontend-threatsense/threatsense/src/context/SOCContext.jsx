import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

const SOCContext = createContext();

export const SOCProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);
    const [metrics, setMetrics] = useState({
        activeAlerts: 0,
        investigating: 0,
        resolvedToday: 0,
        avgRiskScore: 0,
        terminatedSessions: 0
    });
    const [activeSession, setActiveSession] = useState(null);
    const [latestAlert, setLatestAlert] = useState(null);
    const [trendData, setTrendData] = useState([]);
    const [departmentMetrics, setDepartmentMetrics] = useState([]);
    const [terminatedSessions, setTerminatedSessions] = useState([]);
    // New: tracks whether there's a pending live alert popup
    const [liveAlertPending, setLiveAlertPending] = useState(null);

    const fetchInitialData = useCallback(async () => {
        try {
            const [alertsFeed, currentMetrics, trend, deptSummary, sessions] = await Promise.all([
                apiClient.get('/soc/alerts-feed'),
                apiClient.get('/soc/metrics'),
                apiClient.get('/soc/trend'),
                apiClient.get('/soc/department-summary'),
                apiClient.get('/soc/sessions/status')
            ]);
            setAlerts(alertsFeed);
            setMetrics(prev => ({
                ...prev,
                activeAlerts: currentMetrics.totalAnomalies - currentMetrics.resolvedToday,
                investigating: currentMetrics.investigating || 0,
                resolvedToday: currentMetrics.resolvedToday,
                avgRiskScore: currentMetrics.avgRiskScoreLastHour,
                terminatedSessions: currentMetrics.terminatedSessions || 0
            }));
            setTrendData(trend);
            setDepartmentMetrics(deptSummary);
            setTerminatedSessions(sessions);
        } catch (error) {
            console.error('Failed to fetch initial SOC data:', error);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // WebSocket Integration
    useEffect(() => {
        const wsUrl = import.meta.env.VITE_WS_URL.replace('/ws', '/api/soc/session-monitoring');
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Handle status update from SOC action (lock / false_positive)
            if (data.type === 'action_update') {
                setAlerts(prev => prev.map(a =>
                    a.alert_id === data.alert_id
                        ? { ...a, status: data.new_status, session_status: data.session_status }
                        : a
                ));
                if (data.session_status === 'Restored') {
                    setTerminatedSessions(prev => prev.filter(s => s.alert_id !== data.alert_id));
                }
                return;
            }

            // Handle new alert from anomaly detection
            if (data.alert_id) {
                const newAlert = { ...data };
                setAlerts(prev => [newAlert, ...prev]);
                setLatestAlert(newAlert);
                setLiveAlertPending(newAlert); // Trigger popup

                // Track terminated sessions
                if (data.session_status === 'Terminated') {
                    setTerminatedSessions(prev => [newAlert, ...prev]);
                    setMetrics(prev => ({ ...prev, terminatedSessions: prev.terminatedSessions + 1 }));
                }

                setMetrics(prev => ({
                    ...prev,
                    activeAlerts: prev.activeAlerts + 1,
                    avgRiskScore: Math.round((prev.avgRiskScore + data.risk_score) / 2)
                }));
            }
        };

        socket.onopen = () => console.log('SOC WebSocket connected');
        socket.onclose = () => console.log('SOC WebSocket disconnected');

        return () => socket.close();
    }, []);

    const performAction = async (alertId, action, userEmail) => {
        try {
            const response = await apiClient.post('/soc/action', {
                alert_id: alertId,
                action,
                user: userEmail
            });

            setAlerts(prev => prev.map(a =>
                a.alert_id === alertId
                    ? { ...a, status: response.status, session_status: response.session_status }
                    : a
            ));

            // If false positive: remove user from terminated sessions
            if (action === 'false_positive') {
                setTerminatedSessions(prev => prev.filter(s => s.alert_id !== alertId));
            }

            if (response.updated_metrics) {
                setMetrics(response.updated_metrics);
            }

            return response;
        } catch (error) {
            console.error('Action failed:', error);
            throw error;
        }
    };

    const dismissLiveAlert = () => setLiveAlertPending(null);

    const simulateAttack = async (type) => {
        try {
            const response = await apiClient.post('/soc/simulate', { simulation_type: type });
            return response;
        } catch (error) {
            console.error('Simulation failed:', error);
            throw error;
        }
    };

    return (
        <SOCContext.Provider value={{
            alerts,
            metrics,
            activeSession,
            setActiveSession,
            latestAlert,
            setLatestAlert,
            liveAlertPending,
            dismissLiveAlert,
            trendData,
            departmentMetrics,
            terminatedSessions,
            performAction,
            simulateAttack
        }}>
            {children}
        </SOCContext.Provider>
    );
};

export const useSOC = () => {
    const context = useContext(SOCContext);
    if (!context) {
        throw new Error('useSOC must be used within a SOCProvider');
    }
    return context;
};
