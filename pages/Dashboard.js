import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CreateProjectModal from '../components/CreateProjectModal';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects([...projects, newProject]);
    setShowModal(false);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await axios.delete(`/api/projects/${projectId}`);
      setProjects(projects.filter(p => p._id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  return (
    <div className="container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ color: '#1f2937' }}>My Projects</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'white',
          borderRadius: '8px',
          color: '#6b7280'
        }}>
          <h3>No projects yet</h3>
          <p>Create your first project to get started!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {projects.map(project => (
            <div
              key={project._id}
              className="card"
              style={{
                cursor: 'pointer',
                borderTop: `4px solid ${project.color}`,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Link
                to={`/project/${project._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <h3 style={{ marginBottom: '10px', color: '#1f2937' }}>
                  {project.name}
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '15px', fontSize: '14px' }}>
                  {project.description || 'No description'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {project.members?.length || 0} member{(project.members?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
              
              {project.owner && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project._id);
                    }}
                    className="btn btn-danger"
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;
