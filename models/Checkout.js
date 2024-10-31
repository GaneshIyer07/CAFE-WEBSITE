const Checkout = require('../models/Checkout'); // Adjust the path according to your folder structure
const mongoose = require('mongoose');

const placeOrder = async (req, res) => {
    const { items, deliveryAddress, userId } = req.body;

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => total + item.quantity * item.itemPrice, 0); // Ensure itemPrice is available in the item data

    // Create a new checkout entry
    const checkoutEntry = new Checkout({
        orderNumber: Date.now(), // or generate a unique order number as needed
        userId,
        items,
        totalAmount,
        deliveryAddress
    });

    try {
        await checkoutEntry.save();
        return res.status(201).json({ orderNumber: checkoutEntry.orderNumber });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error placing order. Please try again.' });
    }
};

module.exports = { placeOrder };
