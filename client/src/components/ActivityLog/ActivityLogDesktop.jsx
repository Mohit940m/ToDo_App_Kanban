// client/src/components/ActivityLog/ActivityLogDesktop.jsx
import React from 'react';
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

const ActivityLogDesktop = ({ logs, currentUserId, newActivityIds }) => {
  return (
    <aside className="activity-log-desktop">
      <h3>Activity Log</h3>
      <div className="log-container">
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
    </aside>
  );
};

export default ActivityLogDesktop;