const express = require("express");
const router = express.Router();
const Controller = require("./Controllers");


// API Routes for this Project
router.post("/login", Controller.login);
router.post("/logout", Controller.logout);
router.post("/register", Controller.register);
router.get("/getUserID", Controller.getUserID);
router.get("/getUserInfo", Controller.getUserInfo);
router.get("/getTables", Controller.getTables);
router.post("/reserveTable", Controller.reserveTable);
router.post("/cancelReservation", Controller.cancelReservation);


// Export the router
module.exports = router;