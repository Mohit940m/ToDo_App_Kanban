// client/src/components/ActivityLog/ActivityLogMobile.jsx
import React, { useState } from 'react';
import './ActivityLog.css';

const LogItem = ({ log, isCurrentUser, isNew }) => (
  <div className={`log-item ${isCurrentUser ? 'highlight' : ''} ${isNew ? 'new-activity' : ''}`}>
    <p>
      {log.actionType === 'edit' && '✏️ '}
      {log.actionType === 'delete' && '🗑️ '}
      {log.actionType === 'create' && '✨ '}
      {log.actionType === 'assign' && '👤 '}
      {log.actionType === 'move' && '📋 '}
      {log.description}
    </p>
    <div className="meta">
      <span className="user-name">{log.user.name}</span>
      <span className="timestamp">{new Date(log.createdAt || log.timestamp).toLocaleString()}</span>
    </div>
  </div>
);

const ActivityLogMobile = ({ logs, currentUserId, newActivityIds }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasNewActivities = newActivityIds && newActivityIds.size > 0;

  return (
    <>
      {/* Floating toggle button */}
      <button 
        className={`activity-log-floating-toggle ${hasNewActivities ? 'has-new' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Hide Activity Log' : 'Show Activity Log'}
      >
        {isOpen ? '✕' : '📋'}
        {hasNewActivities && !isOpen && (
          <span className="notification-badge">{newActivityIds.size}</span>
        )}
      </button>

      {/* Activity log panel */}
      <div className={`activity-log-mobile ${isOpen ? 'open' : ''}`}>
        <div className="activity-log-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '▼ Hide Activity Log' : '▲ Show Activity Log'}
        </div>
        {isOpen && (
          <div className="activity-log-content">
            <h3>Activity Log</h3>
            {logs && logs.length > 0 ? (
              logs.map(log => (
                <LogItem 
                  key={log._id} 
                  log={log} 
                  isCurrentUser={log.user._id === currentUserId}
                  isNew={newActivityIds?.has(log._id)}
                />
              ))
            ) : (
              <div className="no-logs">
                <p>No activity yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ActivityLogMobile;