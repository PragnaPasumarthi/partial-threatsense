import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { userId, email }
    const [status, setStatus] = useState('UNAUTHENTICATED'); // UNAUTHENTICATED, PENDING, ACTIVE, TERMINATED
    const [socket, setSocket] = useState(null);

    const login = (userId, email) => {
        setUser({ userId, email });
        setStatus('PENDING');
    };

    const logout = () => {
        setUser(null);
        setStatus('UNAUTHENTICATED');
        if (socket) socket.close();
    };

    const handleWebSocketMessage = useCallback((data) => {
        if (data.action === 'VERIFICATION_SUCCESS') {
            setStatus('ACTIVE');
        } else if (data.action === 'TERMINATE_SESSION') {
            setStatus('TERMINATED');
        }
    }, []);

    useEffect(() => {
        if (status === 'PENDING' || status === 'ACTIVE') {
            const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
            const ws = new WebSocket(`${wsUrl}/${encodeURIComponent(user.email)}`);

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            };

            ws.onclose = () => {
                console.log('WS Closed');
            };

            setSocket(ws);
            return () => ws.close();
        }
    }, [status, user?.userId, handleWebSocketMessage]);

    return (
        <SessionContext.Provider value={{ user, status, login, logout, setStatus }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);
