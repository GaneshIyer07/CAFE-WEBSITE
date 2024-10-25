const express = require('express');
const router = express.Router();
const MenuItem = require('../models/Menu'); // Import the MenuItem model
const Checkout = require('../models/Checkout'); // Import the Checkout model

// Middleware to check if admin is authenticated
function isAdminAuthenticated(req, res, next) {
    // This is a placeholder. You can modify this to check if the user is an admin.
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
        console.error(error);
        res.status(500).send("Error loading dashboard");
    }
});

// Add New Menu Item Form (CREATE)
router.get('/dashboard/add', isAdminAuthenticated, (req, res) => {
    res.render('admin/addMenuItem'); // Renders form to add new menu item
});

// Handle Add New Menu Item Form Submission (CREATE)
router.post('/dashboard/add', isAdminAuthenticated, async (req, res) => {
    const { name, description, price, category } = req.body;
    try {
        const newMenuItem = new MenuItem({ name, description, price, category });
        await newMenuItem.save(); // Save new menu item to MongoDB
        res.redirect('/admin/dashboard'); // Redirect to admin dashboard after adding item
    } catch (error) {
        console.error(error);
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
        console.error(error);
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
        console.error(error);
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
        console.error(error);
        res.status(500).send("Error deleting menu item");
    }
});

// View User Checkouts (READ)
    router.get('/dashboard/checkouts', isAdminAuthenticated, async (req, res) => {
    try {
        // Fetch all checkouts and populate user and item details
        const checkouts = await Checkout.find()
            .populate('username', 'email') // Adjust the fields you want to display from User
            .populate('items.itemId'); // Populate item details

        res.render('admin/checkouts', { checkouts }); // Render checkouts view
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading checkouts");
    }
});


module.exports = router;
