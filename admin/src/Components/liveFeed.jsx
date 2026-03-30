import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './LiveFeed.css';

const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001');

export default function LiveFeed() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    socket.on('new_event', (event) => {
      setEvents((prev) => [event, ...prev].slice(0, 100));
    });
    return () => socket.off('new_event');
  }, []);

  const getEventIcon = (eventType) => {
    const icons = {
      'PAGE_VIEW': '📄',
      'CLICK': '🖱️',
      'SEARCH': '🔍',
      'ADD_TO_CART': '🛒',
      'REMOVE_FROM_CART': '❌',
      'PAYMENT': '💳',
      'ORDER_SUCCESS': '✅',
      'LOGIN': '🔐',
      'LOGOUT': '🚪'
    };
    return icons[eventType] || '📌';
  };

  const getEventColor = (eventType) => {
    const colors = {
      'PAGE_VIEW': '#3498db',
      'CLICK': '#9b59b6',
      'SEARCH': '#f39c12',
      'ADD_TO_CART': '#e74c3c',
      'PAYMENT': '#27ae60',
      'ORDER_SUCCESS': '#2ecc71',
      'LOGIN': '#16a085'
    };
    return colors[eventType] || '#95a5a6';
  };

  return (
    <div className="live-feed">
      <h3>📡 Live Event Feed</h3>
      <div className="events-container">
        {events.length === 0 ? (
          <p className="no-events">Waiting for events...</p>
        ) : (
          <ul className="events-list">
            {events.map((e, idx) => (
              <li 
                key={idx} 
                className="event-item"
                style={{ borderLeftColor: getEventColor(e.eventType) }}
              >
                <span className="event-icon">{getEventIcon(e.eventType)}</span>
                <div className="event-content">
                  <span className="event-type">{e.eventType}</span>
                  <span className="user-id">User: {e.userId}</span>
                  {e.details && Object.keys(e.details).length > 0 && (
                    <span className="event-details">
                      {JSON.stringify(e.details).substring(0, 50)}...
                    </span>
                  )}
                </div>
                <span className="event-time">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}