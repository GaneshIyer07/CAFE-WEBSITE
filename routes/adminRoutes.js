const express = require('express');
const router = express.Router();
const MenuItem = require('../models/Menu'); // Import the MenuItem model
const Checkout = require('../models/Checkout'); // Import the Checkout model
const OrderCounter = require('../models/OrderCounter');

// Middleware to check if admin is authenticated
function isAdminAuthenticated(req, res, next) {
    if (req.session.isAdmin) {
        return next();
    } else {
        res.redirect('/auth/login');
    }
}

// Admin Dashboard (READ - List all menu items)
router.get('/dashboard', isAdminAuthenticated, async (req, res) => {
    try {
        const menuItems = await MenuItem.find(); // Get all menu items
        res.render('admin/dashboard', { menuItems }); // Pass menu items to the view
    } catch (error) {
        console.error("Error loading dashboard:", error);
        res.status(500).send("Error loading dashboard");
    }
});

// Add New Menu Item Form (CREATE)
router.get('/dashboard/add', isAdminAuthenticated, (req, res) => {
    res.render('admin/addMenuItem'); // Render form to add new menu item
});

// Handle Add New Menu Item Form Submission (CREATE)
router.post('/dashboard/add', isAdminAuthenticated, async (req, res) => {
    const { name, description, price, category } = req.body;
    try {
        const newMenuItem = new MenuItem({ name, description, price, category });
        await newMenuItem.save(); // Save new menu item to MongoDB
        res.redirect('/admin/dashboard'); // Redirect to admin dashboard after adding item
    } catch (error) {
        console.error("Error adding new menu item:", error);
        res.status(500).send("Error adding new menu item");
    }
});

// Edit Menu Item Form (UPDATE)
router.get('/dashboard/edit/:id', isAdminAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        const menuItem = await MenuItem.findById(id); // Find the menu item by its ID
        if (!menuItem) {
            return res.status(404).send("Menu item not found");
        }
        res.render('admin/editMenuItem', { menuItem }); // Pass menu item to the edit form
    } catch (error) {
        console.error("Error loading edit form:", error);
        res.status(500).send("Error loading edit form");
    }
});

// Handle Edit Menu Item Form Submission (UPDATE)
router.post('/dashboard/edit/:id', isAdminAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category } = req.body;
    try {
        await MenuItem.findByIdAndUpdate(id, { name, description, price, category }); // Update menu item
        res.redirect('/admin/dashboard'); // Redirect to admin dashboard after updating item
    } catch (error) {
        console.error("Error updating menu item:", error);
        res.status(500).send("Error updating menu item");
    }
});

// Delete Menu Item (DELETE)
router.post('/dashboard/delete/:id', isAdminAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        await MenuItem.findByIdAndDelete(id); // Delete menu item by ID
        res.redirect('/admin/dashboard'); // Redirect to admin dashboard after deletion
    } catch (error) {
        console.error("Error deleting menu item:", error);
        res.status(500).send("Error deleting menu item");
    }
});

// Admin Dashboard Route for Checkouts
router.get('/dashboard/checkout', isAdminAuthenticated, async (req, res) => {
    try {
        const checkouts = await Checkout.find()
            .populate('userId')              // Populate user details
            .populate('items.itemId');       // Populate each item's details

        res.render('admin/checkout', { checkouts, error: null }); // Pass error as null if no error
    } catch (error) {
        console.error("Error fetching checkouts:", error);
        res.render('admin/checkout', { error: "Failed to load checkouts", checkouts: [] });
    }
});

// PATCH route to update order status
router.patch('/dashboard/checkout/:checkoutId/status', isAdminAuthenticated, async (req, res) => {
    const { checkoutId } = req.params;
    const { orderStatus } = req.body;

    try {
        const result = await Checkout.findByIdAndUpdate(checkoutId, { orderStatus });
        if (!result) {
            return res.status(404).send("Checkout not found");
        }
        res.sendStatus(200); // Send success status
    } catch (error) {
        console.error("Error updating order status:", error);
        res.sendStatus(500); // Send error status if update fails
    }
});

module.exports = router;
