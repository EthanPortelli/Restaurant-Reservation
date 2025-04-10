const pool = require("./Database"); // Import the database connection
const bcrypt = require('bcryptjs');

//Route to check credentials at login
exports.login = async (req, res) => {
    const { UserName, userPassword } = req.body;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query("SELECT * FROM Users WHERE userName = ?", [UserName]);

        if (result.length > 0) {
            const usersInfo = result[0];
            const passwordMatch = await bcrypt.compare(userPassword, usersInfo.userPassword);

            if (passwordMatch) {
                // Store user ID in the session
                req.session.userID = usersInfo.userID;
                res.json({ ID: usersInfo.userID, success: true });

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


//Route to log out of the session
exports.logout = async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Failed to logout' });
        }
        console.log('User logged out successfully.');
        res.json({ message: 'Logout successful' });
    });
};


//Route to register an account with a hashed password
exports.register = async (req, res) => {
    const { UserName, userPassword } = req.body;

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
        const result = await conn.query("INSERT INTO Users (userName, userPassword) VALUES (?, ?)",
            [UserName, hash]);

        res.json({ message: 'Account created successfully!', success: true });
        conn.release();
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username is already taken' });
        }
        console.error("Database error:", err);
        res.status(500).json({ error: 'Database error when creating an account' });
    }
};



//Route to send server side stored ID to client side
exports.getUserID = async (req, res) => {
    if (req.session.userID) {
        return res.json({ userID: req.session.userID });
    } else {
        return res.json({ userID: null });
    }
};


//Get user information
exports.getUserInfo = async (req, res) => {
    try {
        const userID = req.session.userID;
        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM Users WHERE userID = ?", [userID]);
        res.json(rows);
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error when getting user information.' });
    }
};


// LOAD USER LIST ROUTE (Admin Only)
exports.getTables = async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM Tables");
        res.json(rows);
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};










                                        //START OF ROUTES FOR EDITING ACCOUNT INFORMATION
//Edit username
exports.editUsername = async (req, res) => {
    const { userName } = req.body;

    // Ensure the new username is not empty or invalid
    if (!userName || userName.trim().length === 0) {
        return res.status(400).json({ error: 'Username cannot be empty' });
    }

    try {
        const conn = await pool.getConnection();

        // Ensure user is logged in
        const userID = req.session.userID;
        if (!userID) {
            conn.release();
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        // Check if user exists
        const [rows] = await conn.query("SELECT * FROM usersInfo WHERE userID = ?", [userID]);

        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ error: "User not found" });
        }

        // Update the username in the database
        const result = await conn.query("UPDATE usersInfo SET userName = ? WHERE userID = ?", [userName, userID]);
        conn.release();

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "No changes made to the account" });
        }

        console.log(`Username updated for userID: ${userID}`);
        res.json({ message: 'Username updated successfully!', success: true });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: 'Database error when updating account' });
    }
};


//Edit password
exports.editPassword = async (req, res) => {
    const { userPassword } = req.body;

    // Ensure the new password is not empty or invalid
    if (!userPassword || userPassword.trim().length === 0) {
        return res.status(400).json({ error: 'Password cannot be empty' });
    }

    try {
        const conn = await pool.getConnection();

        // Ensure user is logged in
        const userID = req.session.userID;
        if (!userID) {
            conn.release();
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        // Check if user exists
        const [rows] = await conn.query("SELECT * FROM usersInfo WHERE userID = ?", [userID]);

        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ error: "User not found" });
        }

        //hash new password
        let hash;
        try {
            hash = await bcrypt.hash(userPassword, 10);
        } catch (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ error: 'Error hashing password' });
        }

        // Update the password in the database
        const result = await conn.query("UPDATE usersInfo SET userPassword = ? WHERE userID = ?", [hash, userID]);
        conn.release();

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "No changes made to the account" });
        }

        console.log(`Password updated for userID: ${userID}`);
        res.json({ message: 'Password updated successfully!', success: true });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: 'Database error when updating account' });
    }
};


//Edit email
exports.editEmail = async (req, res) => {
    const { emailAddress } = req.body;

    // Ensure the new email is not empty or invalid
    if (!emailAddress || emailAddress.trim().length === 0) {
        return res.status(400).json({ error: 'Email cannot be empty' });
    }

    try {
        const conn = await pool.getConnection();

        // Ensure user is logged in
        const userID = req.session.userID;
        if (!userID) {
            conn.release();
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        // Check if user exists
        const [rows] = await conn.query("SELECT * FROM usersInfo WHERE userID = ?", [userID]);

        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ error: "User not found" });
        }

        // Update the email in the database
        const result = await conn.query("UPDATE usersInfo SET emailAddress = ? WHERE userID = ?", [emailAddress, userID]);
        conn.release();

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "No changes made to the account" });
        }

        console.log(`Email updated for userID: ${userID}`);
        res.json({ message: 'Email updated successfully!', success: true });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: 'Database error when updating account' });
    }
};


//Edit zipcode
exports.editZip = async (req, res) => {
    const { zipcode } = req.body;

    // Ensure the new zipcode is not empty or invalid
    if (!zipcode || zipcode.trim().length === 0) {
        return res.status(400).json({ error: 'Zipcode cannot be empty' });
    }

    try {
        const conn = await pool.getConnection();

        // Ensure user is logged in
        const userID = req.session.userID;
        if (!userID) {
            conn.release();
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        // Check if user exists
        const [rows] = await conn.query("SELECT * FROM usersInfo WHERE userID = ?", [userID]);

        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ error: "User not found" });
        }

        // Update the zipcode in the database
        const result = await conn.query("UPDATE usersInfo SET zipcode = ? WHERE userID = ?", [zipcode, userID]);
        conn.release();

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "No changes made to the account" });
        }

        console.log(`Zipcode updated for userID: ${userID}`);
        res.json({ message: 'Zipcode updated successfully!', success: true });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: 'Database error when updating account' });
    }
};


//Edit City
exports.editCity = async (req, res) => {
    const { city } = req.body;

    // Ensure the new city is not empty or invalid
    if (!city || city.trim().length === 0) {
        return res.status(400).json({ error: 'City cannot be empty' });
    }

    try {
        const conn = await pool.getConnection();

        // Ensure user is logged in
        const userID = req.session.userID;
        if (!userID) {
            conn.release();
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        // Check if user exists
        const [rows] = await conn.query("SELECT * FROM usersInfo WHERE userID = ?", [userID]);

        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ error: "User not found" });
        }

        // Update the city in the database
        const result = await conn.query("UPDATE usersInfo SET city = ? WHERE userID = ?", [city, userID]);
        conn.release();

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "No changes made to the account" });
        }

        console.log(`City updated for userID: ${userID}`);
        res.json({ message: 'City updated successfully!', success: true });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: 'Database error when updating account' });
    }
};
                                        //END OF ROUTES FOR EDITING ACCOUNT INFORMATION


//Route for creating flyer
exports.createFlyer = async (req, res) => {
    try {
        const { dateLost, lastZipcode, lastCityID, 
                petName, animalType, animalSize, animalColor, animalGender, 
                description } = req.body;
        
        // Get user ID from session
        const userID = req.session.userID;
        if (!userID) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        // Get file path if an image is uploaded
        const fileInput = req.file ? req.file.filename : null;

        // Default status
        const status = "Lost";

        // Insert into database
        const conn = await pool.getConnection();
        const result = await conn.query(`INSERT INTO lostPets 
            (userID, dateLost, lastZipcode, lastCityID, petName, animalType, animalSize, animalColor, animalGender, animal_image_path, description, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [userID, dateLost, lastZipcode, lastCityID, petName, animalType, animalSize, animalColor, animalGender, fileInput, description, status]
        );

        conn.release();

        if (result.affectedRows > 0) {
            console.log(`Flyer created successfully with ID: ${result.insertId}`);
            return res.json({ 
                success: true, 
                message: "Flyer created successfully!", 
                flyerID: Number(result.insertId) // Convert BigInt to Number
            });
        } else {
            return res.status(500).json({ success: false, message: "Failed to create flyer." });
        }

    } catch (err) {
        console.error("Error creating flyer:", err);
        res.status(500).json({ error: "Database error when creating a flyer" });
    }
};


// LOAD MISSING PET POSTS ROUTE 
exports.missingPosts = async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM lostPets WHERE status = 'Lost'");
        res.json(rows);
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error. Unable to grab information from lostPets table.' });
    }
};


// Route to load map for selected page
exports.selectedPostMap = async (req, res) => {
    const {lostPetID} = req.params;

    try {
        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT lastZipcode, lastCityID FROM lostpets WHERE lostID = ?", [lostPetID]);
        res.json(rows);
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error. Unable to grab information from lostPets table.' });
    }
};


//ROUTE TO SHOW THE FOUND PETS
exports.showFoundPosts = async(req, res) => {

    try{ 
        const conn = await pool.getConnection();
        const rows= await conn.query("SELECT foundPets.foundID, foundPets.dateFound, lostPets.petName, lostPets.status, lostPets.animal_image_path From foundPets INNER JOIN lostPets ON lostPets.lostID=foundPets.lostID");
        res.json(rows);
        conn.release();
    } 
    catch (err)
    {
        console.error(err);
        res.status(500).json({error:'Database error. Unable to grab information from lostPets table.'});
    }
};


//ROUTE TO SHOW THE DONATIONS PAGE
exports.showDonations = async(req, res) => {

    try{
        const conn= await pool.getConnection();
        const rows= await conn.query("SELECT donations.donationID, donations.userID,usersInfo.emailAddress, donations.dateCreated,donations.zipcode,donations.itemStatus, donations.itemCategory, donations.itemName,donations.quantity,donations.itemCondition,donations.itemDescription,donations.item_image_path From donations INNER JOIN usersInfo ON usersInfo.userID=donations.userID");
        res.json(rows);
        conn.release();
    }
    catch (err)
    {
        console.error(err);
        res.status(500).json({error:'Database error. Unable to grab information from donations table.'});
    }
};


exports.updateStatus = async (req, res) => {
    const { postID } = req.params;
    const { status } = req.body;

    try {
        const conn = await pool.getConnection();
        const userID = req.session.userID;
        if (!userID) {
            conn.release();
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        const rows = await conn.query("SELECT * FROM lostpets WHERE lostID = ?", [postID]);
        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ error: "Flyer not found" });
        }

        const result = await conn.query("UPDATE lostpets SET status = ? WHERE lostID = ?", [status, postID]);

        const currentDate = new Date().toISOString().split('T')[0];
        const result2 = await conn.query(
            "INSERT INTO foundPets (lostID, dateFound, status) VALUES (?, ?, ?)",
            [postID, currentDate, status]
        );

        conn.release();

        if (result.affectedRows === 0 || result2.affectedRows === 0) {
            return res.status(400).json({ error: "No changes made or flyer not added" });
        }

        console.log(`Flyer updated successfully. FoundID: ${result2.insertId}`);
        return res.json({
            success: true,
            message: "Flyer updated successfully!",
            foundID: Number(result2.insertId)
        });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: 'Database error when updating flyer' });
    }
};




//Route to delete missing pet posts
exports.deleteFlyer = async (req, res) => {
    const { postID } = req.params; 
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction(); // Start a transaction

        // Delete child entries first
        const result1 = await conn.query("DELETE FROM postcomments WHERE lostID = ?", [postID]); 
        const result2 = await conn.query("DELETE FROM foundpets WHERE lostID = ?", [postID]); 
        const result3 = await conn.query("DELETE FROM lostpets WHERE lostID = ?", [postID]); 

        if (result3.affectedRows === 0) {
            await conn.rollback(); // Rollback if no rows were deleted in the main table
            conn.release();
            return res.status(400).json({ error: "No changes made to the flyer" });
        }

        await conn.commit(); // Commit the transaction
        conn.release();

        console.log("Flyer deleted successfully");
        res.json({ success: true, message: "Flyer and related entries deleted successfully." });
    } catch (error) {
        await conn.rollback(); // Rollback on error
        conn.release();
        console.error("Error deleting flyer:", error);
        res.status(500).json({ error: "Database error when deleting flyer" });
    }
};


// Route for the selected post page 
exports.userSelectedPost = async (req,res)=>{
    const {postID}=req.params;
    try{
        const conn= await pool.getConnection();
        const rows= await conn.query("SELECT usersInfo.userName, lostPets.lostID, lostPets.userID,lostPets.dateCreated, lostPets.dateLost, lostPets.lastZipcode,lostPets.lastCityID, lostPets.petName, lostPets.animalType, lostPets.animalSize, lostPets.animalColor, lostPets.animalGender, lostPets.animal_image_path, lostPets.description, lostPets.status FROM lostPets INNER JOIN usersInfo ON usersInfo.userID=lostPets.userID WHERE lostPets.lostID = ?",[postID]);        
        res.json(rows);
        conn.release();
    }
    catch (err)
    {
        console.error(err);
        res.status(500).json({error:'Database error. Unable to grab information about selected post table.'});
    }

};


// Route for the comments for selected post page 
exports.showComments = async (req,res)=>{
    const { postID }=req.params;
    
    try{
        const conn= await pool.getConnection();
        const rows= await conn.query("SELECT usersInfo.userName, postComments.commentID, postComments.lostID, postComments.dateCreated, postComments.commentText, postComments.userID FROM postComments INNER JOIN usersInfo ON usersInfo.userID=postComments.userID WHERE postComments.lostID = ? ",[postID]);        
        res.json(rows);
        conn.release();
    }
    catch (err)
    {
        console.error(err);
        res.status(500).json({error:'Database error. Unable to grab information about comments selected post table.'});
    }

};


//Route to create a flyer
exports.createDonation = async (req, res) => {
    try {
        const { DonationName, quantity, category, 
            condition, description } = req.body;
        
        // Get user ID from session
        const userID = req.session.userID;
        if (!userID) {
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        // Get file path if an image is uploaded
        const fileInput = req.file ? req.file.filename : null;

        // Default item status
        const itemStatus = "Available";

        // Pull user data from database
        const conn = await pool.getConnection();
        const result = await conn.query("SELECT * FROM usersInfo WHERE userID = ?", [userID]);
        const usersInfo = result[0];

        // Insert into database
        await conn.query(`INSERT INTO donations (userID, zipcode, itemStatus, itemCategory, itemName, quantity, itemCondition, itemDescription, item_image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                                [userID, usersInfo.zipcode, itemStatus, category, DonationName, quantity, condition, description, fileInput ]);

        conn.release();

        console.log(`Donation listed successfully.`);
        res.json({ success: true, message: "Donation listed successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error when listing a donation" });
    }
};


//route to create a comment on the selected post page
exports.createComment = async(req,res) =>{
    const{postID}=req.params;
    const{commentText} = req.body;
    const userID = req.session.userID;
        
    if (!userID) {
           conn.release();
           return res.status(401).json({ error: "Unauthorized. Please log in." });
    }
        
    try{
        const conn = await pool.getConnection();
        const rows = await conn.query("INSERT INTO postComments(lostID, commentText, userID) VALUES (?, ?, ?)",[postID,commentText,userID]);
        console.log("Response data:", rows);
        res.json({ message: "Comment created successfully!"});
        conn.release();
        console.log('Comment has been posted successfully.')
    }
    catch (err){
        console.error(err);
        res.status(500).json({error:'Database error. Unable to create a comment for the selected post.'})
    }

};


//Route to delete comments
exports.deleteComment = async (req, res) => {
    const { commentID } = req.params; 
    console.log("Deleting comment with ID:" ,commentID);
    const conn = await pool.getConnection();
    try {
        
        const result = await conn.query("DELETE FROM postcomments WHERE commentID = ?", [commentID]); 
        if (result.affectedRows === 0) {
            conn.release();
            return res.status(400).json({ error: "No changes made to the comment" });
        }

        conn.release();
        console.log("Comment deleted successfully");    
        return res.status(200).json({message:"Comment Deleted successfully from database!"});
        
    } catch (error) {
        conn.release();
        console.error("Error deleting comment:", error);
        return res.status(500).json({ error: "Database error when deleting comment" });
    }
};


//Route to show user related donations
exports.showRelatedDonations = async(req, res) => {

    try{ 

        // Ensure user is logged in
        const userID = req.session.userID;
        
        if (!userID) {
            conn.release();
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }


        const conn = await pool.getConnection();
        const rows= await conn.query("SELECT * FROM donations WHERE userID = ?",[userID]);
        res.json(rows);
        conn.release();
    } 
    catch (err)
    {
        console.error(err);
        res.status(500).json({error:'Database error. Unable to grab information from donations table for this user.'});
    }
};


//Route to show user related missing pet posts
exports.showRelatedMissingPosts = async(req, res) => {

    try{ 

        // Ensure user is logged in
        const userID = req.session.userID;
        
        
        if (!userID) {
            conn.release();
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        const conn = await pool.getConnection();
        const rows= await conn.query("SELECT * FROM lostPets WHERE userID = ?",[userID]);
        res.json(rows);
        conn.release();
    } 
    catch (err)
    {
        console.error(err);
        res.status(500).json({error:'Database error. Unable to grab information from lostPets table for this user.'});
    }
};


//Route to show user related found pet posts
exports.showRelatedFoundPosts = async(req, res) => {
    
    try{ 

        // Ensure user is logged in
        const userID = req.session.userID;
        
        if (!userID) {
            conn.release();
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }


        const conn = await pool.getConnection();
        const rows= await conn.query("SELECT foundPets.foundID, foundPets.dateFound, lostPets.petName, lostPets.status, lostPets.animal_image_path From foundPets INNER JOIN lostPets ON lostPets.lostID=foundPets.lostID WHERE lostPets.userID = ?",[userID]);
        res.json(rows);
        conn.release();
    } 
    catch (err)
    {
        console.error(err);
        res.status(500).json({error:'Database error. Unable to grab information from foundPets table for this user.'});
    }
};


//Route to delete donation 
exports.deleteDonation = async (req, res) => {
    const { donationID } = req.params;

    try {
        const conn = await pool.getConnection();

        // Ensure user is logged in
        const userID = req.session.userID;
        if (!userID) {
            conn.release();
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        // Check if flyer exists
        const [rows] = await conn.query("SELECT * FROM donations WHERE donationID = ?", [donationID]);

        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ error: "Donation not found" });
        }

        // Delete the donation in the database
        const result = await conn.query("DELETE FROM donations WHERE donationID = ?", [donationID]);

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "No changes made to the donation post" });
        }

        console.log(`Donation deleted`);
        res.json({ message: 'Donation deleted successfully!', success: true });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: 'Database error when deleting donation' });
    }
};


//Route to update donation status
exports.updateDonation = async (req, res) => {
    const { donationID } = req.params;
    const { status } = req.body;

    try {
        const conn = await pool.getConnection();

        // Ensure user is logged in
        const userID = req.session.userID;
        if (!userID) {
            conn.release();
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        // Check if donation exists
        const [rows] = await conn.query("SELECT * FROM donations WHERE donationID = ?", [donationID]);

        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ error: "Donation not found" });
        }

        // Update the donation in the database
        const result = await conn.query("UPDATE donations SET itemStatus = ? WHERE donationID = ?", [status, donationID]);

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "No changes made to the donation post" });
        }

        console.log(`Status updated for donation`);
        res.json({ message: 'Donation updated successfully!', success: true });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: 'Database error when updating donation' });
    }
};

// LOAD MISSING PET POSTS BASED ON SEARCH BAR 
exports.searchBarMissing = async (req, res) => {
    const {lostID}= req.params;
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM lostPets WHERE lostID=?", [lostID]);
        res.json(rows);
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error. Unable to grab specific lostID information from lostPets table.' });
    }
};


// LOAD FOUND PET POSTS BASED ON SEARCH BAR 
exports.searchBarFound = async (req, res) => {
    const {foundID}= req.params;
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT foundPets.foundID, foundPets.dateFound, lostPets.petName, lostPets.status, lostPets.animal_image_path From foundPets INNER JOIN lostPets ON lostPets.lostID=foundPets.lostID WHERE foundPets.foundID = ?",[foundID]);
        res.json(rows);
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error. Unable to grab specific foundID information from foundPets table.' });
    }
};


// Route for donation filtering (SHOULD WORK AS IS, MAY REQUIRE SLIGHT DEBUGGING)
exports.filterDonations = async (req, res) => {
    const { category, condition, sortBy } = req.query; // Access query params from req.query

    let query = 'SELECT * FROM donations';
    const params = [];
    const conditions = [];
  
    if (category) {
      conditions.push('itemCategory = ?');
      params.push(category);
    }
  
    if (condition) {
      conditions.push('itemCondition = ?');
      params.push(condition);
    }
  
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
  
    if (sortBy === 'oldest') {
      query += ' ORDER BY dateCreated ASC';
    } else if (sortBy === 'newest') {
      query += ' ORDER BY dateCreated DESC';
    }

    try {
        const results = await pool.query(query, params);
        console.log(results);
        res.json(results); // Send back the results as JSON
    } catch (error) {
        res.status(500).json({ error: 'Database query failed' });
    }
};




exports.reunitedFilter = async (req, res) => {
    const {userOption}= req.params;
    console.log("user selection:", userOption);
    let filter='';
    
    if (userOption=="newest"){
        filter= 'ORDER BY dateCreated ASC';
    }
    else if (userOption=="oldest"){
        filter='ORDER BY dateCreated DESC';
    }
    
    const startQuery = "SELECT foundPets.foundID, foundPets.dateFound, lostPets.petName, lostPets.status, lostPets.animal_image_path From foundPets INNER JOIN lostPets ON lostPets.lostID=foundPets.lostID";
    const finalQuery= startQuery +" " +filter;
    //console.log(finalQuery);
    
    try{
        const conn = await pool.getConnection();
        const rows = await conn.query(finalQuery);
        res.json(rows);
        conn.release();
    }
    catch(error){
        console.error(err);
        res.status(500).json({error: 'Database error when getting found posts using filter'});
    }
};
























// ADD ITEM ROUTE 
exports.addItem = async (req, res) => {
    const { item_name, item_price, quantity } = req.body;
    console.log(`[POST /add-item] Adding item: ${item_name}, Quantity: ${quantity}`);

    try {
        const conn = await pool.getConnection();

        // Insert the new item into the inventory table
        const result = await conn.query(
            "INSERT INTO inventory (item_name, item_price, quantity) VALUES (?, ?, ?)",
            [item_name, item_price, quantity]
        );

        console.log(`Item added: ${item_name}, Price: ${item_price}, Quantity: ${quantity}`);
        res.json({ message: 'Item added successfully!' });

        conn.release();
    } catch (err) {
        console.error(`[POST /add-item] Error adding item:`, err);
        res.status(500).json({ error: 'Failed to add item' });
    }
};

// DELETE ITEM ROUTE (Admin Only)
exports.deleteItem = async (req, res) => {
    const { id } = req.params;

    console.log(`Received DELETE request to delete item with ID: ${id}`); // Added log to confirm route is hit

    try {
        const conn = await pool.getConnection();
        const result = await conn.query("DELETE FROM inventory WHERE id = ?", [id]);
        conn.release();

        if (result.affectedRows > 0) {
            console.log(`Item with ID ${id} deleted successfully.`); // Log successful deletion
            res.json({ message: 'Item deleted successfully!' });
        } else {
            console.log(`Item with ID ${id} not found in the database.`); // Log not found
            res.status(404).json({ error: 'Item not found.' });
        }
    } catch (err) {
        console.error(`[DELETE /delete-item/:id] Error deleting item:`, err);
        res.status(500).json({ error: 'Failed to delete item' });
    }
};

// UPDATE ITEM ROUTE
exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    console.log(`Received UPDATE request to update item with ID: ${id}`); // Added log to confirm route is hit

    try {
        const conn = await pool.getConnection();
        const result = await conn.query("UPDATE inventory SET quantity = ? WHERE id = ?", [quantity, id]);
        conn.release();

        if (result.affectedRows > 0) {
            console.log(`Item with ID ${id} updated successfully.`); // Log successful update
            res.json({ message: 'Item updated successfully!' });
        } else {
            console.log(`Item with ID ${id} not found in the database.`); // Log not found
            res.status(404).json({ error: 'Item not found.' });
        }
    } catch (err) {
        console.error(`[PATCH /update-item/:id] Error updating item:`, err);
        res.status(500).json({ error: 'Failed to update item' });
    }

}

// LOAD USER LIST ROUTE (Admin Only)
exports.users = async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM users");
        res.json(rows);
        conn.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

// ADD USER ROUTE (Admin Only)
exports.addUser = async (req, res) => {
    const { username, password, firstName, lastName, role } = req.body;
    console.log(`[POST /add-user] Adding User: ${firstName} ${lastName}`);

    try {
        const conn = await pool.getConnection();

        // Hash the user's password
        let hash;
        try {
            hash = await bcrypt.hash(password, 10);
        } catch (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ error: 'Error hashing password' });
        }

        // Insert the new user into the inventory table
        const result = await conn.query(
            "INSERT INTO users (username, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)",
            [username, hash, firstName, lastName, role]
        );

        console.log(`User added: ${firstName} ${lastName}, Role: ${role}`);
        res.json({ message: 'User added successfully!' });

        conn.release();
    } catch (err) {
        console.error(`[POST /add-user] Error adding user:`, err);
        res.status(500).json({ error: 'Failed to add user' });
    }
};

// DELETE ITEM ROUTE (Admin Only)
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    console.log(`Received DELETE request to delete user with ID: ${id}`); // Added log to confirm route is hit

    try {
        const conn = await pool.getConnection();
        const result = await conn.query("DELETE FROM users WHERE id = ?", [id]);
        conn.release();

        if (result.affectedRows > 0) {
            console.log(`User with ID ${id} deleted successfully.`); // Log successful deletion
            res.json({ message: 'User deleted successfully!' });
        } else {
            console.log(`User with ID ${id} not found in the database.`); // Log not found
            res.status(404).json({ error: 'User not found.' });
        }
    } catch (err) {
        console.error(`[DELETE /delete-user/:id] Error deleting user:`, err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// UPDATE USER ROLE ROUTE (Admin Only)
exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    console.log(`Received UPDATE request to update user role with ID: ${id}`); // Added log to confirm route is hit

    try {
        const conn = await pool.getConnection();
        const result = await conn.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
        conn.release();

        if (result.affectedRows > 0) {
            console.log(`User with ID ${id} updated successfully.`); // Log successful update
            res.json({ message: 'User role updated successfully!' });
        } else {
            console.log(`User with ID ${id} not found in the database.`); // Log not found
            res.status(404).json({ error: 'User not found.' });
        }
    } catch (err) {
        console.error(`[PATCH /update-role/:id] Error updating user role:`, err);
        res.status(500).json({ error: 'Failed to update user role' });
    }

}