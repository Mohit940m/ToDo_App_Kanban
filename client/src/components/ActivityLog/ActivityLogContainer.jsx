// client/src/components/ActivityLog/ActivityLogContainer.jsx
import React from 'react';
import { useActivityLog } from '../../hooks/useActivityLog';
import useMediaQuery from '../../hooks/useMediaQuery';
import ActivityLogDesktop from './ActivityLogDesktop';
import ActivityLogMobile from './ActivityLogMobile';

// Get the current user's ID from localStorage
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?._id || user?.id;
};

const ActivityLogContainer = () => {
  const { logs, loading, error, newActivityIds } = useActivityLog();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const currentUserId = getCurrentUserId();

  if (loading) {
    return (
      <div className="activity-log-loading">
        <div className="loading-spinner">Loading activity...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-log-error">
        <div>Error: {error}</div>
      </div>
    );
  }

  if (isDesktop) {
    return <ActivityLogDesktop logs={logs} currentUserId={currentUserId} newActivityIds={newActivityIds} />;
  }

  return <ActivityLogMobile logs={logs} currentUserId={currentUserId} newActivityIds={newActivityIds} />;
};

export default ActivityLogContainer;