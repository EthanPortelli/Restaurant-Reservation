const express = require('express');
const cors = require('cors');  // Import CORS middleware
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

//Enable cors
app.use(cors());

// Middleware for parsing URL-encoded and JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images)
app.use(express.static(__dirname));
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



