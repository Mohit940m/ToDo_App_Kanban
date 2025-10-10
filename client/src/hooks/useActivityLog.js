// client/src/hooks/useActivityLog.js
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';
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
        console.log('Fetching activity logs from:', url);
        const response = await API.get(url);
        console.log('Activity logs response:', response.data);
        setLogs(response.data);
      } catch (err) {
        console.error('Error fetching activity logs:', err);
        console.error('Error details:', err.response);
        setError(err.response?.data?.message || 'Failed to fetch activity logs');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchLogs();

    // Join the board room if boardId exists, with ack verification
    if (boardId) {
      console.log('[ActivityLog] Attempting to join board room:', boardId);
      socket.emit('join-board', boardId, (resp) => {
        if (!resp?.ok) {
          console.warn('[ActivityLog] join-board failed:', resp);
        } else {
          console.log('[ActivityLog] ✅ Successfully joined room:', resp.boardId, 'rooms:', resp.rooms);
        }
      });
    }

    // Handler for new activity logs
    const handleActivityLogged = (newActivity) => {
      console.log('[ActivityLog] 🔔 New activity received:', newActivity);
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
    };

    // Attach socket listeners on shared socket
    console.log('[ActivityLog] Attaching activity-logged listener for boardId:', boardId);
    socket.on('activity-logged', handleActivityLogged);

    const onConnect = () => {
      console.log('[ActivityLog] Socket connected, ID:', socket.id);
    };
    socket.on('connect', onConnect);

    const onConnectError = (err) => {
      console.error('[ActivityLog] Socket connection error:', err);
    };
    socket.on('connect_error', onConnectError);

    // Cleanup function: remove listeners (do not disconnect shared socket)
    return () => {
      console.log('[ActivityLog] Cleaning up listeners for boardId:', boardId);
      socket.off('activity-logged', handleActivityLogged);
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
    };
  }, [boardId]); // Re-run when boardId changes

  return { logs, loading, error, newActivityIds, currentUserId };
};