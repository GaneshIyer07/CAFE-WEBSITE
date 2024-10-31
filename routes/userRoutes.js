const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Menu = require('../models/Menu');
const Checkout = require('../models/Checkout');
const OrderCounter = require('../models/OrderCounter');
const router = express.Router();

// Async Handler for DRY error handling in routes
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/'); // Redirect to login page if not authenticated
    }
}

// Registration Page
router.get('/register', (req, res) => {
    const successMessage = req.query.success === 'true' ? 'Registration successful!' : null;
    res.render('auth/register', { successMessage });
});

// Registration Handler
router.post('/register', asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.redirect('/');
}));

// Login Page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Login Handler
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        req.session.isAdmin = user.type === 'admin';
        
        res.redirect(user.type === 'admin' ? '/admin/dashboard' : '/auth/dashboard');
    } else {
        res.status(401).send("Invalid credentials");
    }
}));

// User Dashboard
router.get('/dashboard', isAuthenticated, asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/auth/login');
    res.render('auth/dashboard', { user });
}));

// Route to display the menu
router.get('/dashboard/displaymenu', isAuthenticated, asyncHandler(async (req, res) => {
    const menuItems = await Menu.find();
    const user = await User.findById(req.session.userId);
    res.render('auth/displaymenu', { menuItems, user });
}));

// Outlets and Orders Page Routes
router.get('/dashboard/outlets', isAuthenticated, asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/auth/login');
    res.render('auth/outlets', { user });
}));

router.get('/dashboard/orders', isAuthenticated, asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/auth/login');
    res.render('auth/orders', { user });
}));

// Menu Page
router.get('/dashboard/orders/menu', isAuthenticated, asyncHandler(async (req, res) => {
    const user = await User.findById(req.session.userId);
    const menuItems = await Menu.find();
    if (!user) return res.redirect('/auth/login');
    res.render('auth/menu', { user, menuItems }); 
}));

// Cart Page
router.get('/dashboard/orders/cart', isAuthenticated, (req, res) => {
    res.render('auth/cart');
});

// Checkout Page
router.get('/dashboard/orders/cart/checkout', isAuthenticated, (req, res) => {
    res.render('auth/checkout', { error: null });
});

// Checkout Handler with Order Counter
router.post('/dashboard/orders/cart/checkout', isAuthenticated, asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { items, deliveryAddress } = req.body;

    // Check for valid items array
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }

    // Validate each item and calculate total amount
    let totalAmount = 0;
    const itemsArray = [];
    for (const item of items) {
        if (!item.itemId || typeof item.quantity !== 'number' || item.quantity <= 0) {
            return res.status(400).json({ error: 'Invalid item structure: Each item must have a valid itemId and quantity greater than zero' });
        }

        const menuItem = await Menu.findById(item.itemId);
        if (!menuItem) {
            return res.status(400).json({ error: `Menu item not found for ID: ${item.itemId}` });
        }

        itemsArray.push({ itemId: item.itemId, quantity: item.quantity });
        totalAmount += menuItem.price * item.quantity;
    }

    // Generate a unique order number using OrderCounter
    const orderCounter = await OrderCounter.findOneAndUpdate(
        { _id: 'orderCounter' },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
    );
    const orderNumber = orderCounter.sequenceValue;

    // Save the checkout order
    const newCheckout = new Checkout({
        orderNumber,
        userId,
        items: itemsArray,
        totalAmount,
        deliveryAddress,
        orderStatus: 'Pending'
    });
    await newCheckout.save();

    // Respond with confirmation
    res.status(201).json({ message: 'Order placed successfully', orderNumber });
}));

// Logout Handler
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send("Error logging out");
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;
