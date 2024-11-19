const express = require('express');
const router = express.Router();
const MenuItem = require('../models/Menu'); 
const Checkout = require('../models/Checkout'); 
const OrderCounter = require('../models/OrderCounter'); 

function isAdminAuthenticated(req, res, next) {
    if (req.session.isAdmin) {
        return next();
    } else {
        res.redirect('/auth/login');
    }
}

router.get('/dashboard', isAdminAuthenticated, async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.render('admin/dashboard', { menuItems });
    } catch (error) {
        console.error("Error loading dashboard:", error);
        res.status(500).send("Error loading dashboard");
    }
});

router.get('/dashboard/add', isAdminAuthenticated, (req, res) => {
    res.render('admin/addMenuItem');
});

router.post('/dashboard/add', isAdminAuthenticated, async (req, res) => {
    const { name, description, price, category } = req.body;
    try {
        const newMenuItem = new MenuItem({ name, description, price, category });
        await newMenuItem.save();
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Error adding new menu item:", error);
        res.status(500).send("Error adding new menu item");
    }
});

router.get('/dashboard/edit/:id', isAdminAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).send("Menu item not found");
        }
        res.render('admin/editMenuItem', { menuItem });
    } catch (error) {
        console.error("Error loading edit form:", error);
        res.status(500).send("Error loading edit form");
    }
});

router.post('/dashboard/edit/:id', isAdminAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category } = req.body;
    try {
        await MenuItem.findByIdAndUpdate(id, { name, description, price, category });
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Error updating menu item:", error);
        res.status(500).send("Error updating menu item");
    }
});

router.post('/dashboard/delete/:id', isAdminAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        await MenuItem.findByIdAndDelete(id);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Error deleting menu item:", error);
        res.status(500).send("Error deleting menu item");
    }
});

router.get('/dashboard/checkout', isAdminAuthenticated, async (req, res) => {
    try {
        const checkouts = await Checkout.find()
            .populate('userId')
            .populate('items.itemId');
        res.render('admin/checkout', { checkouts, error: null });
    } catch (error) {
        console.error("Error fetching checkouts:", error);
        res.render('admin/checkout', { error: "Failed to load checkouts", checkouts: [] });
    }
});

    router.patch('/dashboard/checkout/:checkoutId/status', isAdminAuthenticated, async (req, res) => {
    const { checkoutId } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Completed', 'Delivered'];

    // Check if the provided status is valid
    if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({ error: 'Invalid order status' });
    }

    try {
        const checkout = await Checkout.findByIdAndUpdate(checkoutId, { orderStatus }, { new: true });

        if (!checkout) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated successfully', checkout });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});


router.post('/dashboard/checkout/:checkoutId/delete', isAdminAuthenticated, async (req, res) => {
    const { checkoutId } = req.params;

    try {
        const result = await Checkout.findByIdAndDelete(checkoutId);

        if (!result) {
            return res.status(404).send("Order not found");
        }

        res.redirect('/admin/dashboard/checkout');
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).send("Error deleting order");
    }
});


module.exports = router;