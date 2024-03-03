// admin-controller.js

const User = require("../models/User");
const BookingRequest = require("../models/BookingRequest");
const Package = require("../models/Package");

exports.getDashboardSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPackages = await Package.countDocuments();
    const totalBookingRequests = await BookingRequest.countDocuments();

    // Get counts for pending, accepted, and declined exchange requests
    const pendingBookingRequests = await BookingRequest.countDocuments({
      status: "pending",
    });
    const acceptedBookingRequests = await BookingRequest.countDocuments({
      status: "accepted",
    });
    const declinedBookingRequests = await BookingRequest.countDocuments({
      status: "declined",
    });

    res.json({
      totalUsers,
      totalPackages,
      totalBookingRequests,
      pendingBookingRequests,
      acceptedBookingRequests,
      declinedBookingRequests,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// View all users
exports.viewAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password from the results
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    User.findByIdAndDelete(req.params.userId)
      .then((reply) => res.status(204).end())
      .catch(next);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
