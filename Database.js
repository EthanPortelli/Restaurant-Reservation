// Import required modules
const mariadb = require("mariadb"); // MariaDB client for Node.js

// Set up the MariaDB connection pool
const pool = mariadb.createPool({
    host: "localhost", // Database host
    user: "testuser", // Database username
    password: "1234", // Database password
    database: "restaurantDatabase", // Database name
    connectionLimit: 10, // Maximum number of connections in the pool
});

module.exports = pool; // Export the pool for uses