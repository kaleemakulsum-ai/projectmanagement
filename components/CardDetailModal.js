import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CardDetailModal = ({ card, onClose, onCardUpdated }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState(card.priority || 'medium');
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.split('T')[0] : '');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [projectMembers, setProjectMembers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState(card.assignedTo?.map(u => u._id) || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
    fetchProjectMembers();
  }, [card._id]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/${card._id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchProjectMembers = async () => {
    try {
      const projectResponse = await axios.get(`/api/projects/${card.board}`);
      setProjectMembers(projectResponse.data.members);
    } catch (error) {
      console.error('Error fetching project members:', error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.put(`/api/cards/${card._id}`, {
        title,
        description,
        priority,
        dueDate: dueDate || null,
        assignedTo: assignedUsers
      });
      onCardUpdated(response.data);
    } catch (error) {
      setError('Failed to update card');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post('/api/comments', {
        text: newComment,
        card: card._id
      });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleAssignment = (userId) => {
    if (assignedUsers.includes(userId)) {
      setAssignedUsers(assignedUsers.filter(id => id !== userId));
    } else {
      setAssignedUsers([...assignedUsers, userId]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '700px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <h2 style={{ color: '#1f2937', margin: 0 }}>Card Details</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>
        
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
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: 'bold' }}>
                Title
              </label>
              <input
                type="text"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: 'bold' }}>
                Priority
              </label>
              <select
                className="input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: 'bold' }}>
                Due Date
              </label>
              <input
                type="date"
                className="input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontWeight: 'bold' }}>
                Assignees
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {projectMembers.map(member => (
                  <div
                    key={member._id}
                    onClick={() => toggleAssignment(member._id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '20px',
                      background: assignedUsers.includes(member._id) ? '#3b82f6' : '#e5e7eb',
                      color: assignedUsers.includes(member._id) ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: assignedUsers.includes(member._id) ? 'white' : '#3b82f6',
                      color: assignedUsers.includes(member._id) ? '#3b82f6' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px'
                    }}>
                      {member.username.charAt(0).toUpperCase()}
                    </span>
                    {member.username}
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '15px', color: '#1f2937', fontSize: '16px' }}>Comments</h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
              {comments.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>No comments yet</p>
              ) : (
                comments.map(comment => (
                  <div
                    key={comment._id}
                    style={{
                      background: '#f9fafb',
                      padding: '10px',
                      borderRadius: '6px',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#374151' }}>
                        {comment.author.username}
                      </span>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                      {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleAddComment}>
              <textarea
                className="input"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                style={{ resize: 'none', marginBottom: '10px' }}
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '13px' }}>
                Add Comment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;
