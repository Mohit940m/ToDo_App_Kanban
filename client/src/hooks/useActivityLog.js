// client/src/hooks/useActivityLog.js
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import API from '../api/api';

export const useActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newActivityIds, setNewActivityIds] = useState(new Set());

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await API.get('/api/actions');
        setLogs(response.data);
      } catch (err) {
        console.error('Error fetching activity logs:', err);
        setError(err.response?.data?.message || 'Failed to fetch activity logs');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchLogs();

    // Set up socket connection for real-time updates
    const socket = io(import.meta.env.VITE_API_URL);

    // Listen for new activity logs
    socket.on('activity-logged', (newActivity) => {
      console.log('New activity received:', newActivity);
      setLogs(prevLogs => {
        // Add new activity to the beginning and keep only last 20
        const updatedLogs = [newActivity, ...prevLogs].slice(0, 20);
        return updatedLogs;
      });
      
      // Mark this activity as new for visual highlighting
      setNewActivityIds(prev => new Set([...prev, newActivity._id]));
      
      // Remove the new activity highlight after 3 seconds
      setTimeout(() => {
        setNewActivityIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(newActivity._id);
          return newSet;
        });
      }, 3000);
    });

    // Handle socket connection errors
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    // Cleanup function
    return () => {
      socket.disconnect();
    };
  }, []);

  return { logs, loading, error, newActivityIds };
};