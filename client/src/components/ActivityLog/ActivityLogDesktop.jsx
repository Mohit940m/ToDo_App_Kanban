// client/src/components/ActivityLog/ActivityLogDesktop.jsx
import React from 'react';
import { Activity } from 'lucide-react';
import deleteIcon from '../../assets/close.svg';
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

const ActivityLogDesktop = ({
  isVisible,
  onToggleVisibility,
  logs,
  currentUserId,
  newActivityIds
}) => {
  // When minimized, show a floating button to reopen it.
  if (!isVisible) {
    return (
      <button
        className="activity-log-floating-toggle"
        onClick={onToggleVisibility}
        aria-label="Show activity log"
      >
        <Activity size={24} />
      </button>
    );
  }

  // When visible, show the full panel.
  return (
    <aside className="activity-log-desktop">
      <div className="activity-log-header">
        <h3>Activity Log</h3>
        <button
          onClick={onToggleVisibility}
          className="minimize-btn"
          aria-label="Minimize activity log"
        >
          <img src={deleteIcon} alt="Minimize activity log" />
        </button>
      </div>
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