import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useSocket } from '../context/SocketContext';
import CreateListModal from '../components/CreateListModal';
import CreateCardModal from '../components/CreateCardModal';
import CardDetailModal from '../components/CardDetailModal';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState([]);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showCardDetail, setShowCardDetail] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket, joinProject, leaveProject } = useSocket();

  useEffect(() => {
    fetchProject();
    fetchBoards();
    joinProject(projectId);

    return () => {
      leaveProject(projectId);
    };
  }, [projectId]);

  useEffect(() => {
    if (selectedBoard) {
      fetchLists();
      setupSocketListeners();
    }
  }, [selectedBoard]);

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on('list-created', (newList) => {
      setLists(prev => [...prev, newList]);
    });

    socket.on('list-updated', (updatedList) => {
      setLists(prev => prev.map(l => l._id === updatedList._id ? updatedList : l));
    });

    socket.on('list-deleted', (listId) => {
      setLists(prev => prev.filter(l => l._id !== listId));
    });

    socket.on('card-created', (newCard) => {
      setCards(prev => [...prev, newCard]);
    });

    socket.on('card-updated', (updatedCard) => {
      setCards(prev => prev.map(c => c._id === updatedCard._id ? updatedCard : c));
    });

    socket.on('card-moved', (movedCard) => {
      setCards(prev => prev.map(c => c._id === movedCard._id ? movedCard : c));
    });

    socket.on('card-deleted', (cardId) => {
      setCards(prev => prev.filter(c => c._id !== cardId));
    });

    return () => {
      socket.off('list-created');
      socket.off('list-updated');
      socket.off('list-deleted');
      socket.off('card-created');
      socket.off('card-updated');
      socket.off('card-moved');
      socket.off('card-deleted');
    };
  };

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchBoards = async () => {
    try {
      const response = await axios.get(`/api/boards/${projectId}`);
      setBoards(response.data);
      if (response.data.length > 0) {
        setSelectedBoard(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLists = async () => {
    try {
      const response = await axios.get(`/api/lists/${selectedBoard}`);
      setLists(response.data);
      
      // Fetch cards for all lists
      const cardsPromises = response.data.map(list => 
        axios.get(`/api/cards/${list._id}`)
      );
      const cardsResponses = await Promise.all(cardsPromises);
      const allCards = cardsResponses.flatMap(res => res.data);
      setCards(allCards);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (type === 'LIST') {
      const newLists = [...lists];
      const [reorderedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, reorderedList);

      setLists(newLists);

      // Update order on backend
      newLists.forEach(async (list, index) => {
        await axios.put(`/api/lists/${list._id}`, { order: index });
      });
    } else if (type === 'CARD') {
      const sourceListId = source.droppableId;
      const destListId = destination.droppableId;

      const newCards = [...cards];
      const [reorderedCard] = newCards.splice(source.index, 1);
      reorderedCard.list = destListId;
      newCards.splice(destination.index, 0, reorderedCard);

      setCards(newCards);

      // Update card on backend
      await axios.put(`/api/cards/${draggableId}/move`, {
        list: destListId,
        order: destination.index
      });
    }
  };

  const handleCreateList = (newList) => {
    setLists([...lists, newList]);
    setShowListModal(false);
  };

  const handleCreateCard = (newCard) => {
    setCards([...cards, newCard]);
    setShowCardModal(false);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowCardDetail(true);
  };

  const getCardsForList = (listId) => {
    return cards
      .filter(card => card.list === listId)
      .sort((a, b) => a.order - b.order);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  if (!project) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Project not found</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '10px' }}>{project.name}</h1>
        <p style={{ color: '#6b7280' }}>{project.description || 'No description'}</p>
      </div>

      {boards.length > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <select
            className="input"
            value={selectedBoard || ''}
            onChange={(e) => setSelectedBoard(e.target.value)}
            style={{ maxWidth: '300px' }}
          >
            {boards.map(board => (
              <option key={board._id} value={board._id}>
                {board.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedBoard && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="LIST">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  display: 'flex',
                  gap: '20px',
                  overflowX: 'auto',
                  paddingBottom: '20px',
                  minHeight: '500px'
                }}
              >
                {lists
                  .sort((a, b) => a.order - b.order)
                  .map((list, index) => (
                    <Draggable key={list._id} draggableId={list._id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            background: '#f1f5f9',
                            borderRadius: '8px',
                            padding: '15px',
                            minWidth: '300px',
                            maxWidth: '300px'
                          }}
                        >
                          <div
                            {...provided.dragHandleProps}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '15px'
                            }}
                          >
                            <h3 style={{ color: '#1f2937', fontSize: '16px' }}>{list.name}</h3>
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>
                              {getCardsForList(list._id).length}
                            </span>
                          </div>

                          <Droppable droppableId={list._id} type="CARD">
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={{ minHeight: '100px' }}
                              >
                                {getCardsForList(list._id).map((card, cardIndex) => (
                                  <Draggable key={card._id} draggableId={card._id} index={cardIndex}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() => handleCardClick(card)}
                                        style={{
                                          ...provided.draggableProps.style,
                                          background: 'white',
                                          padding: '12px',
                                          borderRadius: '6px',
                                          marginBottom: '10px',
                                          cursor: 'pointer',
                                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                          borderLeft: `3px solid ${
                                            card.priority === 'high' ? '#ef4444' :
                                            card.priority === 'medium' ? '#f59e0b' : '#10b981'
                                          }`
                                        }}
                                      >
                                        <p style={{ margin: 0, color: '#1f2937', fontSize: '14px' }}>
                                          {card.title}
                                        </p>
                                        {card.description && (
                                          <p style={{
                                            margin: '5px 0 0',
                                            color: '#6b7280',
                                            fontSize: '12px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}>
                                            {card.description}
                                          </p>
                                        )}
                                        {card.assignedTo && card.assignedTo.length > 0 && (
                                          <div style={{ marginTop: '8px', display: 'flex', gap: '5px' }}>
                                            {card.assignedTo.slice(0, 3).map(user => (
                                              <div
                                                key={user._id}
                                                style={{
                                                  width: '24px',
                                                  height: '24px',
                                                  borderRadius: '50%',
                                                  background: '#3b82f6',
                                                  color: 'white',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  fontSize: '10px'
                                                }}
                                              >
                                                {user.username.charAt(0).toUpperCase()}
                                              </div>
                                            ))}
                                            {card.assignedTo.length > 3 && (
                                              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                                +{card.assignedTo.length - 3}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>

                          <button
                            onClick={() => {
                              setSelectedList(list);
                              setShowCardModal(true);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px',
                              background: 'transparent',
                              border: '1px dashed #cbd5e1',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#6b7280',
                              fontSize: '13px',
                              marginTop: '10px'
                            }}
                          >
                            + Add Card
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}

                <button
                  onClick={() => setShowListModal(true)}
                  style={{
                    minWidth: '300px',
                    maxWidth: '300px',
                    padding: '15px',
                    background: 'rgba(255,255,255,0.5)',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}
                >
                  + Add List
                </button>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {showListModal && (
        <CreateListModal
          boardId={selectedBoard}
          onClose={() => setShowListModal(false)}
          onListCreated={handleCreateList}
        />
      )}

      {showCardModal && selectedList && (
        <CreateCardModal
          listId={selectedList._id}
          boardId={selectedBoard}
          onClose={() => setShowCardModal(false)}
          onCardCreated={handleCreateCard}
        />
      )}

      {showCardDetail && selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setShowCardDetail(false)}
          onCardUpdated={(updatedCard) => {
            setCards(cards.map(c => c._id === updatedCard._id ? updatedCard : c));
            setSelectedCard(updatedCard);
          }}
        />
      )}
    </div>
  );
};

export default ProjectBoard;
