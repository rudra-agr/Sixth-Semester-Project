const express = require('express');
const router = express.Router();
const UserEvent = require('../models/UserEvent');

// POST /api/events - Log a single event
router.post('/', async (req, res) => {
  try {
    const { userId, eventType, details } = req.body;
    
    if (!userId || !eventType) {
      return res.status(400).json({ error: 'userId and eventType are required' });
    }

    const event = new UserEvent({ userId, eventType, details });
    await event.save();
    
    // Emit to all connected admin clients in real-time
    if (req.io) {
      req.io.emit('new_event', event);
    }
    
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// POST /api/events/batch - Log multiple events at once
router.post('/batch', async (req, res) => {
  try {
    const { events } = req.body;
    
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'events array is required' });
    }

    const savedEvents = await UserEvent.insertMany(events);
    
    if (req.io) {
      savedEvents.forEach(event => req.io.emit('new_event', event));
    }
    
    res.status(201).json({ success: true, count: savedEvents.length });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;