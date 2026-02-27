import { useEffect, useState, useRef } from 'react';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export const useWebSocket = (user_id, onMessage) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!user_id) return;

        const socket = new WebSocket(`${SOCKET_URL}/${user_id}`);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('WS Message Received:', data);
            if (onMessage) onMessage(data);
        };

        socket.onclose = () => {
            console.log('WebSocket Disconnected');
            setIsConnected(false);
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        return () => {
            socket.close();
        };
    }, [user_id, onMessage]);

    return { isConnected };
};
