const mongoose = require('mongoose');

const userEventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    eventType: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: Object }
});

module.exports = mongoose.model('UserEvent', userEventSchema);