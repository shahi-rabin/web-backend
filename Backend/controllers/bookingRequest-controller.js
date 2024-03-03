const BookingRequest = require("../models/BookingRequest");
const Package = require("../models/Package");
const User = require("../models/User");

const getUserBookingRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const bookingRequests = await BookingRequest.find({
      requestedUser: userId,
    })
      .sort({ createdAt: -1 })
      .populate("requestedPackage");

    const bookingRequestsData = await Promise.all(
      bookingRequests.map(async (request) => {
        const requestedPackageData = await Package.findById(
          request.requestedPackage._id
        );

        const user = await User.findById(requestedPackageData.user.id);

        const createdAt = new Date(request.createdAt);
        const currentTime = new Date();
        const timeDifference = Math.abs(currentTime - createdAt);

        let formattedTime;

        if (timeDifference < 60000) {
          formattedTime = Math.floor(timeDifference / 1000) + " seconds ago";
        } else if (timeDifference < 3600000) {
          formattedTime =
            Math.floor(timeDifference / 60000) + " minutes ago";
        } else if (timeDifference < 86400000) {
          formattedTime =
            Math.floor(timeDifference / 3600000) + " hours ago";
        } else {
          formattedTime =
            Math.floor(timeDifference / 86400000) + " days ago";
        }

        return {
          _id: request._id,
          requester: user.toObject(),
          requestedPackage: request.requestedPackage.toObject(),
          requestedPackageTitle: requestedPackageData.title,
          requestedPackageAuthor: requestedPackageData.user.username,
          requestedPackageCover: requestedPackageData.bookCover,
          requestedPackageId: request.requestedPackage._id, // Rename from 'requestedPackage' to 'requestedPackageId'
          status: request.status,
          formattedCreatedAt: formattedTime,
          email: request.email, // Add email field
          contactNum: request.contactNum, // Add contactNum field
          furtherRequirements: request.furtherRequirements, // Add furtherRequirements field
        };
      })
    );

    res.json({
      data: bookingRequestsData,
    });
  } catch (error) {
    next(error);
  }
};

// Get all booking requests
const getAllBookingRequests = async (req, res, next) => {
  try {
    const bookingRequests = await BookingRequest.find()
      .populate("requester")
      .populate("requestedPackage")

    res.json(bookingRequests);
  } catch (error) {
    
    next(error);
  }
};

// Get accepted booking requests of current user

const createBookingRequest = async (req, res, next) => {
  try {
    const { package_id } = req.params;
    const requester = req.user.id;

    const user = await User.findById(requester);
    const requestedPackage = await Package.findById(package_id);

    if (!user) {
      return res.status(404).json({ error: "Requester user not found" });
    }

    if (!requestedPackage) {
      return res.status(404).json({ error: "Requested package not found" });
    }

    const bookingRequest = new BookingRequest({
      requester: user.toObject(),
      requestedPackage: requestedPackage.toObject(),
      requestedUser: requestedPackage.user.id,
      statusUpdatedAt: Date.now(),
      email: req.body.email, // Add email field
      contactNum: req.body.contactNum, // Add contactNum field
      furtherRequirements: req.body.furtherRequirements, // Add furtherRequirements field
    });

    const savedBookingRequest = await bookingRequest.save();

    res.json(savedBookingRequest);
  } catch (error) {
    next(error);
  }
};

// Accept an booking request
const acceptBookingRequest = async (req, res, next) => {
  try {
    const requestId = req.params.request_id;

    const bookingRequest = await BookingRequest.findByIdAndUpdate(
      requestId,
      { status: "accepted", statusUpdatedAt: Date.now() },
      { new: true }
    );

    if (!bookingRequest) {
      return res.status(404).json({ error: "Booking request not found" });
    }

    res.json(bookingRequest);
  } catch (error) {
    
    next(error);
  }
};

// Decline an booking request
const declineBookingRequest = async (req, res, next) => {
  try {
    const requestId = req.params.request_id;

    // delete
    const bookingRequest = await BookingRequest.findByIdAndDelete(requestId);

    if (!bookingRequest) {
      return res.status(404).json({ error: "Booking request not found" });
    }

    res.json({ message: "Booking request declined" });
  } catch (error) {
    
    next(error);
  }
};

const getAcceptedBookingRequests = async (req, res, next) => {
  const axios = require("axios");

  try {
    const userId = req.user.id;

    // Find all accepted booking requests
    const allAcceptedBookingRequests = await BookingRequest.find({
      status: "accepted",
    })
      .sort({ createdAt: -1 })
      .populate("requestedPackage")

    // Map the bookingRequestsData and include the proposalPackageUser for each request
    const bookingRequestsData = allAcceptedBookingRequests
      .filter((request) => request.requester._id.toString() === userId)
      .map((request, index) => {

        const createdAt = new Date(request.createdAt);
        const currentTime = new Date();
        const timeDifference = Math.abs(currentTime - createdAt);

        let formattedTime;
        if (timeDifference < 60000) {
          formattedTime = Math.floor(timeDifference / 1000) + " seconds ago";
        } else if (timeDifference < 3600000) {
          formattedTime = Math.floor(timeDifference / 60000) + " minutes ago";
        } else if (timeDifference < 86400000) {
          formattedTime = Math.floor(timeDifference / 3600000) + " hours ago";
        } else {
          formattedTime = Math.floor(timeDifference / 86400000) + " days ago";
        }

        return {
          _id: request._id,
          requester: request.requester,
          requestedPackage: request.requestedPackage.toObject(),
          status: request.status,
          formattedCreatedAt: formattedTime,
        };
      });

    res.json({
      data: bookingRequestsData,
    });
  } catch (error) {
    
    next(error);
  }
};

module.exports = {
  getAllBookingRequests,
  getUserBookingRequests,
  createBookingRequest,
  acceptBookingRequest,
  declineBookingRequest,
  getAcceptedBookingRequests,
};
