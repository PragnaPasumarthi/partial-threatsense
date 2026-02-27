import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { apiClient } from '../services/apiClient';

const TelemetryTracker = () => {
    const location = useLocation();
    const { user, status } = useSession();

    useEffect(() => {
        if (status !== 'ACTIVE' || !user) return;

        const logAction = async () => {
            try {
                const path = location.pathname;
                let logType = "File Access"; // Default
                let fileAccessed = path;

                // Map routes to simulation types for the ML model
                if (path.includes('finance')) logType = "Sensitive File Access";
                if (path.includes('sales')) logType = "Data Export";
                if (path.includes('hr')) logType = "Sensitive File Access";
                if (path.includes('soc')) logType = "System Config Change";

                const payload = {
                    user: user.email,
                    log_type: logType,
                    department: "Engineering", // Simplification for MVP, could be derived from user
                    file_accessed: fileAccessed,
                    location: "Mumbai", // Mocked for MVP
                    device_type: "Laptop (Mac/Linux)", // Mocked for MVP
                    timestamp: new Date().toISOString()
                };

                await apiClient.post('/actions/log', payload);
                console.log('Telemetry Logged:', logType, fileAccessed);
            } catch (error) {
                console.error('Failed to log telemetry:', error);
            }
        };

        logAction();
    }, [location.pathname, user, status]);

    return null;
};

export default TelemetryTracker;
