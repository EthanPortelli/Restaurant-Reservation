const express = require("express");
const router = express.Router();
const Controller = require("./Controllers");
const multer = require("multer");

// Configure Multer Storage for Donation Images
const storageDonation = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "donationsImages/"); // Folder where images are stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Unique filename
    }
});
const uploadDonation = multer({ storage: storageDonation });

// Configure Multer Storage for Pet Images
const storagePet = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "projectImages/"); // Folder where images are stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Unique filename
    }
});
const uploadPet = multer({ storage: storagePet });


// API Routes for this Project
router.post("/login", Controller.login);
router.post("/logout", Controller.logout);
router.post("/register", Controller.register);
router.get("/getUserID", Controller.getUserID);
router.get("/getUserInfo", Controller.getUserInfo);
router.get("/getTables", Controller.getTables);



//Not being used in this project
router.post("/editUsername", Controller.editUsername);
router.post("/editPassword", Controller.editPassword);
router.post("/editEmail", Controller.editEmail);
router.post("/editZip", Controller.editZip);
router.post("/editCity", Controller.editCity);
router.post("/createFlyer", uploadPet.single("animal_image_path"), Controller.createFlyer);
router.get("/missingPosts", Controller.missingPosts);
router.get("/selectedPostMap/:lostPetID", Controller.selectedPostMap); //shows the map for selected post
router.get("/showfoundPosts", Controller.showFoundPosts);
router.get("/showDonations", Controller.showDonations);
router.post("/updateStatus/:postID", Controller.updateStatus);
router.delete("/deleteFlyer/:postID", Controller.deleteFlyer);
router.get("/userSelectedPost/:postID",Controller.userSelectedPost); //shows actual post
router.get("/showComments/:postID",Controller.showComments);
router.post("/createDonation", uploadDonation.single("donation_image_path"), Controller.createDonation);
router.post("/createComment/:postID", Controller.createComment);
router.delete("/deleteComment/:commentID", Controller.deleteComment);
router.get("/showRelatedDonations", Controller.showRelatedDonations);
router.get("/showRelatedMissingPosts", Controller.showRelatedMissingPosts);
router.get("/showRelatedFoundPosts", Controller.showRelatedFoundPosts);
router.delete("/deleteDonation/:donationID", Controller.deleteDonation);
router.post("/updateDonation/:donationID", Controller.updateDonation);
router.get("/searchBarMissing/:lostID",Controller.searchBarMissing);
router.get("/searchBarFound/:foundID",Controller.searchBarFound);
router.get("/reunitedFilter/:userOption", Controller. reunitedFilter);
router.get("/filterDonations/",Controller.filterDonations);  // when calling use the format: /filterDonations?category=XXX&condition=YYY&sortBy=ZZZ
                                                            // XXX , YYY, and ZZZ should be replaced with an actual value (e.g., Bedding, New, oldest, etc.)
/*
router.get("/inventory", Controller.inventory);
router.post("/add-item", Controller.addItem);
router.delete("/delete-item/:id", Controller.deleteItem);
router.patch("/update-item/:id", Controller.updateItem);
router.get("/users", Controller.users)
router.post("/add-user", Controller.addUser);
router.delete("/delete-user/:id", Controller.deleteUser);
router.patch("/update-role/:id", Controller.updateRole);
*/

// Export the router
module.exports = router;