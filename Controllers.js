const pool = require("./Database"); // Import the database connection
const bcrypt = require('bcryptjs');


// Route to check credentials at login
exports.login = async (req, res) => {
    const { UserName, userPassword } = req.body; // receive data from client

    try {
        const conn = await pool.getConnection();
        const result = await conn.query("SELECT * FROM Users WHERE userName = ?", [UserName]);

        if (result.length > 0) {
            const usersInfo = result[0];
            const passwordMatch = await bcrypt.compare(userPassword, usersInfo.userPassword);

            if (passwordMatch) {
                // Store user ID in the session
                req.session.userID = usersInfo.userID;
                res.json({ ID: usersInfo.userID, success: true }); // send JSON response to client

            } else {
                console.log(`Failed login attempt: ${UserName} (Invalid password)`);
                res.status(401).json({ message: 'Invalid password' });
            }
        } else {
            console.log(`Failed login attempt: ${UserName} (User not found)`);
            res.status(404).json({ message: 'User not found' });
        }

        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error when logging in' });
    }
};


// Route to log out of the session
exports.logout = async (req, res) => {
    // received request from client
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Failed to logout' });
        }
        console.log('User logged out successfully.');
        res.json({ message: 'Logout successful' }); // send JSON response to client
    });
};


// Route to register an account with a hashed password
exports.register = async (req, res) => {
    const { UserName, userPassword } = req.body; // receive data from client

    let hash;
    try {
        // Hash the password
        hash = await bcrypt.hash(userPassword, 10);
    } catch (err) {
        console.error("Error hashing password:", err);
        return res.status(500).json({ error: 'Error hashing password' });
    }

    try {
        const conn = await pool.getConnection();

        const results = await conn.query("SELECT * FROM Users WHERE userName = ?", [UserName]);
        const existingUser = results[0]; // Extract the first element

        if (existingUser && existingUser.length > 0) {
            conn.release();
            return res.status(400).json({ error: 'Username is already taken' });
        }

        // Insert the new user into the database
        const result = await conn.query("INSERT INTO Users (userName, userPassword) VALUES (?, ?)", [UserName, hash]);

        res.json({ message: 'Account created successfully!', success: true }); // send JSON response to client
        conn.release();
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username is already taken' });
        }
        console.error("Database error:", err);
        res.status(500).json({ error: 'Database error when creating an account' });
    }
};


// Route to send server side stored ID to client side
exports.getUserID = async (req, res) => {
    // received request from client
    if (req.session.userID) {
        return res.json({ userID: req.session.userID }); // send JSON response to client
    } else {
        return res.json({ userID: null }); // send JSON response to client
    }
};


// Route to get user information
exports.getUserInfo = async (req, res) => {
    // received request from client
    try {
        const userID = req.session.userID;
        const conn = await pool.getConnection();
        const data1 = await conn.query("SELECT * FROM Users WHERE userID = ?", [userID]);
        const data2 = await conn.query("SELECT * FROM Reservations WHERE userID = ?", [userID]);
        const combinedData = [data1, data2];

        res.json(combinedData); // send JSON response to client
        console.log(combinedData);
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error when getting user information.' });
    }
};


// Route to load all tables
exports.getTables = async (req, res) => {
    // received request from client
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM Tables ");
        res.json(rows); // send JSON response to client
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};


// Route to reserve a table
exports.reserveTable = async (req, res) => {
    const { tableID } = req.body; // receive data from client

    try {
        const conn = await pool.getConnection();

        // Ensure user is logged in
        const userID = req.session.userID;
        if (!userID) {
            conn.release();
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        //Check that table exists 
        const [rows] = await conn.query("SELECT * FROM Tables WHERE tableID = ?", [tableID]);
        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ error: "Table not found" });
        }
                
    
        // Update the table status in the database
        const tableStatus = "Claimed";
        const result1 = await conn.query("UPDATE Tables SET tableStatus = ? WHERE tableID = ?", [tableStatus, tableID]);
        if (result1.affectedRows === 0) {
            return res.status(400).json({ error: "No changes made to the database" });
        }
        
        // Record the table reservation in the database
        const result2 = await conn.query("INSERT INTO Reservations (userID, tableID) VALUES (?, ?)", [userID, tableID]);
        if (result2.affectedRows === 0) {
            return res.status(400).json({ error: "No changes made to the database" });
        }

        //Get the reservation ID to ensure it worked
        const result3 = await conn.query("SELECT * FROM Reservations WHERE userID = ? AND tableID = ?", [userID, tableID]);
        if (result3.affectedRows === 0) {
            return res.status(400).json({ error: "No changes made to the database" });
        }

        conn.release();

        console.log(`Status updated for table: ${tableID}`);
        console.log(`Reservation created for user: ${userID}`);
        res.json({ message: 'Table reserved successfully!', success: true }); // send JSON response to client  

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: 'Database error when reserving a table' });
    }
};


// Route to cancel a reservation
exports.cancelReservation = async (req, res) => {
    const { reservationID, tableID } = req.body; // receive data from client

    try {
        const conn = await pool.getConnection();

        // Ensure user is logged in
        const userID = req.session.userID;
        if (!userID) {
            conn.release();
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        //Check that the reservation exists 
        const [rows] = await conn.query("SELECT * FROM Reservations WHERE reservationID = ?", [reservationID]);
        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ error: "Reservation not found" });
        }
        
        // Change the table status to "Available"
        await conn.query("UPDATE Tables SET tableStatus = 'Available' WHERE tableID = ?", [tableID]);

        // Remove the reservation from the database
        await conn.query("DELETE FROM Reservations WHERE reservationID = ?", [reservationID]);

        conn.release();

        console.log(`Reservation ${reservationID} cancelled for user: ${userID}`);
        res.json({ message: 'Reservation cancelled successfully!', success: true }); // send JSON response to client

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: 'Database error when cancelling the reservation' });
    }
};