const mongoose = require('mongoose');

const orderCounterSchema = new mongoose.Schema({
    count: { type: Number, default: 0 }
});

module.exports = mongoose.model('OrderCounter', orderCounterSchema);
