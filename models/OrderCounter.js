const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderCounterSchema = new Schema(
    {
        _id: { type: String, required: true },  // Treat _id as a string
        sequenceValue: { type: Number, required: true }
    },
    { _id: false } // To prevent auto-generated ObjectId
);

const OrderCounter = mongoose.model('OrderCounter', orderCounterSchema);

module.exports = OrderCounter;
