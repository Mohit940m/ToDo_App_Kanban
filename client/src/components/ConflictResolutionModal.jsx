import React from 'react';
import './ConflictResolutionModal.css';

// Helper to display a single field's comparison
const ConflictField = ({ label, localValue, serverValue }) => {
  const isDifferent = String(localValue || '') !== String(serverValue || '');
  return (
    <div className={`conflict-field ${isDifferent ? 'different' : ''}`}>
      <strong className="field-label">{label}:</strong>
      <div className="field-values">
        <div className="value-yours">
          <span>Your Version:</span>
          <p>{localValue || <em>empty</em>}</p>
        </div>
        <div className="value-server">
          <span>Server Version:</span>
          <p>{serverValue || <em>empty</em>}</p>
        </div>
      </div>
    </div>
  );
};

function ConflictResolutionModal({ localTask, serverTask, onOverwrite, onDiscard }) {
    // Helper to get user name for display
    const getUserName = (user) => {
        if (!user) return 'Unassigned';
        // Handle both populated and unpopulated user objects
        return user.name || 'Unassigned';
    };

    return (
        <div className="conflict-modal-overlay" onClick={onDiscard}>
            <div className="conflict-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Resolve Edit Conflict</h3>
                <p className="conflict-intro">
                    This task was updated by someone else while you were editing. Please choose how to proceed.
                </p>

                <div className="conflict-details">
                    <ConflictField
                        label="Title"
                        localValue={localTask.title}
                        serverValue={serverTask.title}
                    />
                    <ConflictField
                        label="Description"
                        localValue={localTask.description}
                        serverValue={serverTask.description}
                    />
                    <ConflictField
                        label="Status"
                        localValue={localTask.status}
                        serverValue={serverTask.status}
                    />
                    <ConflictField
                        label="Priority"
                        localValue={localTask.priority}
                        serverValue={serverTask.priority}
                    />
                    <ConflictField
                        label="Assigned To"
                        localValue={getUserName(localTask.assignedTo)}
                        serverValue={getUserName(serverTask.assignedTo)}
                    />
                </div>

                <div className="conflict-modal-actions">
                    <button className="overwrite-btn" onClick={onOverwrite}>
                        Overwrite with My Changes
                    </button>
                    <button className="discard-btn" onClick={onDiscard}>
                        Discard My Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConflictResolutionModal;