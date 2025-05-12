// Import required module
const mariadb = require("mariadb"); // MariaDB client for Node.js

// Set up the MariaDB connection pool
const pool = mariadb.createPool({
    host: "localhost", 
    user: "testuser", 
    password: "1234", 
    database: "restaurantDatabase", 
    connectionLimit: 10, // Maximum number of connections in the pool
});


module.exports = pool; // Export the pool for uses