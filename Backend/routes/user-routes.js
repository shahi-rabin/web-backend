const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploads");
const userController = require("../controllers/user-controller");
const { verifyUser } = require("../middlewares/auth");

// User registration
router.post("/register", userController.registerUser);

// User login
router.post("/login", userController.loginUser);

// Get user profile
router.get("/", verifyUser, userController.getUserProfile);

// Get user info from user id
router.get("/:user_id", userController.getUserInfoById);

// Update password
router.put("/change-password", verifyUser, userController.updatePassword);

// Update user profile
router.put("/edit-profile", verifyUser, userController.updateUserProfile);

// Upload image
router.post("/uploadImage", verifyUser, upload, userController.uploadImage);

// Get all booking requests for a user
router.get("/:user_id/booking-requests", userController.getAllExchangeRequests);

module.exports = router;
