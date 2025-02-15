// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Import user routes
const userRoutes = require('./routes/userRoutes'); 
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false, 
        maxAge: 1000 * 60 * 30 
    }
}));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));


// Use admin routes
app.use('/admin', adminRoutes);
// Use userRoutes for auth routes
app.use('/auth', userRoutes);

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/menu', (req, res) => {
    res.render('menu');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

// Route for outlets page
app.get('/outlets', (req, res) => {
    res.render('outlets');
});

app.get('/orders', (req, res) => {
    res.render('orders');
});

app.get('/displaymenu', (req, res) => {
    res.render('displaymenu');
});

app.get('/checkout', (req, res) => {
    res.render('checkout');
});

app.get('/order-history', (req, res) => {
    res.render('order-history');
});

app.get('/ordertrack',(req,res) => {
    res.render('ordertrack');
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});