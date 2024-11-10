const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderCounterSchema = new Schema({
    _id: { type: String, required: true }, 
    sequenceValue: { type: Number, default: 1, required: true }
}, {
    _id: false 
});

const OrderCounter = mongoose.model('OrderCounter', orderCounterSchema);

module.exports = OrderCounter;
