// Helper function to log user events
export function logUserEvent(userId, eventType, details = {}) {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  
  fetch(`${backendUrl}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, eventType, details })
  }).catch(err => console.error('Event logging failed:', err));
}

// Batch event logging for better performance
let eventQueue = [];
const BATCH_SIZE = 10;
const BATCH_TIMEOUT = 5000;
let batchTimer = null;

export function queueUserEvent(userId, eventType, details = {}) {
  eventQueue.push({ userId, eventType, details });
  
  if (eventQueue.length >= BATCH_SIZE) {
    flushBatch();
  } else if (!batchTimer) {
    batchTimer = setTimeout(flushBatch, BATCH_TIMEOUT);
  }
}

function flushBatch() {
  if (eventQueue.length === 0) return;
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  
  fetch(`${backendUrl}/api/events/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: eventQueue })
  }).catch(err => console.error('Batch send failed:', err));
  
  eventQueue = [];
  clearTimeout(batchTimer);
  batchTimer = null;
}