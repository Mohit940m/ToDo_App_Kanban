// client/src/components/ActivityLog/ActivityLogContainer.jsx
import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { useActivityLog } from '../../hooks/useActivityLog';
import ActivityLogDesktop from './ActivityLogDesktop';
import ActivityLogMobile from './ActivityLogMobile';
import './ActivityLog.css'; // For loading/error styles

// Accept the new props from Homepage.jsx
const ActivityLogContainer = ({ isDesktopVisible, onToggleDesktopVisibility, user }) => {
  const { logs, newActivityIds, loading, error, currentUserId } = useActivityLog(user);
  const isDesktop = useMediaQuery({ query: '(min-width: 769px)' });

  if (loading && isDesktop) {
    return <div className="activity-log-loading"><div className="loading-spinner">Loading Activity...</div></div>;
  }

  if (error && isDesktop) {
    return <div className="activity-log-error"><div>{error}</div></div>;
  }

  if (isDesktop) {
    // Pass the props down to the desktop component
    return (
      <ActivityLogDesktop 
        isVisible={isDesktopVisible} 
        onToggleVisibility={onToggleDesktopVisibility}
        logs={logs}
        currentUserId={currentUserId}
        newActivityIds={newActivityIds}
      />
    );
  }
  
  // For mobile, loading/error states can be handled inside the component if needed
  return (
    <ActivityLogMobile 
      logs={logs}
      currentUserId={currentUserId}
      newActivityIds={newActivityIds}
      isLoading={loading}
    />
  );
};

export default ActivityLogContainer;