// client/src/hooks/useActivityLog.js
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../api/api';

export const useActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newActivityIds, setNewActivityIds] = useState(new Set());
  const { boardId } = useParams();
  
  // Get current user ID
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserId = user?._id;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch activities for the current board if boardId exists
        const url = boardId ? `/api/actions?boardId=${boardId}` : '/api/actions';
        const response = await API.get(url);
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

    // Join the board room if boardId exists
    if (boardId) {
      socket.emit('join-board', boardId);
    }

    // Listen for new activity logs
    socket.on('activity-logged', (newActivity) => {
      console.log('New activity received:', newActivity);
      if (newActivity && newActivity._id) {
        setLogs(prevLogs => {
          // Check if activity already exists to avoid duplicates
          const exists = prevLogs.some(log => log._id === newActivity._id);
          if (!exists) {
            // Add new activity to the beginning and keep only last 20
            const updatedLogs = [newActivity, ...prevLogs].slice(0, 20);
            
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
            
            return updatedLogs;
          }
          return prevLogs;
        });
      }
    });

    // Handle socket connection errors
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    // Cleanup function
    return () => {
      socket.disconnect();
    };
  }, [boardId]); // Re-run when boardId changes

  return { logs, loading, error, newActivityIds, currentUserId };
};