// models/Checkout.js
const mongoose = require('mongoose');

const checkoutSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }, // Assuming Menu is the menu item model
        quantity: { type: Number, required: true }
    }],
    address: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Checkout', checkoutSchema);
