// userRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Make sure the path to your User model is correct
const Menu = require('../models/Menu'); // Make sure the path to your User model is correct

const router = express.Router();

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
    res.render('auth/register');
});

// Registration Handler
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.redirect('/'); // Redirect to login after successful registration
    } catch (error) {
        console.error(error);
        res.status(500).send("Error during registration");
    }
});

// Login Page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Login Handler
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            // Successful login
            req.session.userId = user._id; // Store user ID in session
            req.session.isAdmin = user.type === 'admin'; // Set isAdmin flag in session if user is admin
            
            // Redirect based on user type
            if (user.type === 'admin') {
                res.redirect('/admin/dashboard'); // Redirect to admin dashboard
            } else {
                res.redirect('/auth/dashboard'); // Redirect to user dashboard
            }
        } else {
            res.status(401).send("Invalid credentials");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error during login");
    }
});

router.get('/dashboard', isAuthenticated, async (req, res) => {
    const id = req.session.userId;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.redirect('/auth/login');
        }
        res.render('auth/dashboard', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading dashboard");
    }
});

// Route to display the menu from MongoDB
router.get('/dashboard/menu', isAuthenticated, async (req, res) => {
    try {
        const menuItems = await Menu.find(); // Fetch all menu items from MongoDB
        const user = await User.findById(req.session.userId); // Fetch user data
        res.render('auth/menu', { menuItems, user }); // Pass menuItems and user data to the view
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching menu items");
    }
});

router.get('/dashboard/outlets', isAuthenticated, async (req, res) => {
    const id = req.session.userId;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.redirect('/auth/login');
        }
        res.render('auth/outlets', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading Outlets");
    }
});

// Route to display the cart page
router.get('/dashboard/cart', (req, res) => {
    res.render('auth/cart'); // Render the cart.ejs view
});



// Logout Handler
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Error logging out");
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// Export the router
module.exports = router;
