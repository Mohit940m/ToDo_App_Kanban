import React from 'react';
import './DeleteConfirmationModal.css';

function DeleteConfirmationModal({ onConfirm, onCancel, taskTitle }) {
  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
        <h4>Confirm Deletion</h4>
        <p>Are you sure you want to delete the task "{taskTitle}"?</p>
        <div className="delete-modal-actions">
          <button className="delete-btn-confirm" onClick={onConfirm}>
            Delete
          </button>
          <button className="cancel-btn-confirm" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;