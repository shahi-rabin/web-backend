const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middlewares/auth");
const bookingRequestController = require("../controllers/bookingRequest-controller");

// Get all booking requests
router.get("/", verifyUser, bookingRequestController.getAllBookingRequests);

// Get user's booking request
router.get(
  "/booking-requests",
  verifyUser,
  bookingRequestController.getUserBookingRequests
);

// Create an booking request
router.post(
  "/:package_id/booking-request",
  verifyUser,
  bookingRequestController.createBookingRequest
);

// Accept an booking request
router.put(
  "/booking-request/:request_id/accept",
  bookingRequestController.acceptBookingRequest
);

// Decline an booking request
router.delete(
  "/booking-request/:request_id/decline",
  bookingRequestController.declineBookingRequest
);

// Get accepted booking requests of current user
router.get(
  "/booking-requests/accepted",
  verifyUser,
  bookingRequestController.getAcceptedBookingRequests
);

module.exports = router;
