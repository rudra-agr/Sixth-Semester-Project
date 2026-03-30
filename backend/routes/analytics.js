const express = require('express');
const router = express.Router();
const UserEvent = require('../models/UserEvent');

// GET /api/analytics - Get filtered events
router.get('/', async (req, res) => {
  try {
    const { userId, eventType, start, end, limit = 1000 } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (eventType) filter.eventType = eventType;
    
    if (start || end) {
      filter.timestamp = {};
      if (start) filter.timestamp.$gte = new Date(start);
      if (end) filter.timestamp.$lte = new Date(end);
    }

    const events = await UserEvent.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// GET /api/analytics/daily-counts - Daily traffic
router.get('/daily-counts', async (req, res) => {
  try {
    const data = await UserEvent.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// GET /api/analytics/peak-hours - Traffic by hour
router.get('/peak-hours', async (req, res) => {
  try {
    const data = await UserEvent.aggregate([
      {
        $group: {
          _id: { $hour: "$timestamp" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// GET /api/analytics/funnel - Conversion funnel
router.get('/funnel', async (req, res) => {
  try {
    const pageView = await UserEvent.countDocuments({ eventType: 'PAGE_VIEW' });
    const addToCart = await UserEvent.countDocuments({ eventType: 'ADD_TO_CART' });
    const payment = await UserEvent.countDocuments({ eventType: 'PAYMENT' });
    const orderSuccess = await UserEvent.countDocuments({ eventType: 'ORDER_SUCCESS' });

    res.json({
      pageView,
      addToCart,
      payment,
      orderSuccess,
      cartConversion: ((addToCart / pageView) * 100).toFixed(2),
      paymentConversion: ((payment / addToCart) * 100).toFixed(2),
      successConversion: ((orderSuccess / payment) * 100).toFixed(2)
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// GET /api/analytics/event-types - Count by event type
router.get('/event-types', async (req, res) => {
  try {
    const data = await UserEvent.aggregate([
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 }
        }
      },
      { $sort: { "count": -1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// GET /api/analytics/top-users - Most active users
router.get('/top-users', async (req, res) => {
  try {
    const data = await UserEvent.aggregate([
      {
        $group: {
          _id: "$userId",
          eventCount: { $sum: 1 }
        }
      },
      { $sort: { "eventCount": -1 } },
      { $limit: 10 }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;