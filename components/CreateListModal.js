import React, { useState } from 'react';
import axios from 'axios';

const CreateListModal = ({ boardId, onClose, onListCreated }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('List name is required');
      return;
    }

    try {
      const response = await axios.post('/api/lists', {
        name,
        board: boardId
      });
      onListCreated(response.data);
    } catch (error) {
      setError('Failed to create list');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Create New List</h2>
        
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#374151' }}>
              List Name *
            </label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListModal;
