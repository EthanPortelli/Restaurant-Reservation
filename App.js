const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express(); 
const PORT = process.env.PORT || 3000;
const Routes = require("./Routes");

// Configure express-session
app.use(session({
    secret: 'secret_key', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true } 
}));

// Middleware for parsing URL-encoded and JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files 
app.use(express.static(path.join(__dirname)));

// Use routes
app.use(Routes);

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'loginPage.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});