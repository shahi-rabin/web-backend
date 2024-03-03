const upload = require("../middlewares/uploads");
const Package = require("../models/Package");
const User = require("../models/User");

const getAllPackages = async (req, res, next) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json({
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};

const getPackagesUploadedByOthers = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;

    const packages = await Package.find().sort({ createdAt: -1 });

    const userInfo = await User.findById(loggedInUserId);

    const currentTime = new Date();
    const otherPackages = packages.map((trippackage) => {
      const createdAt = new Date(trippackage.createdAt);
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

      const isBookmarked = userInfo.bookmarkedPackages.includes(
        trippackage.id.toString()
      );

      return {
        ...trippackage.toObject(),
        formattedCreatedAt: formattedTime,
        isBookmarked: isBookmarked,
      };
    });

    // Filter out the packages uploaded by the logged-in user
    const otherPackagesUploadedBy = otherPackages.filter((trippackage) => {
      return trippackage.user && trippackage.user.id !== loggedInUserId;
    });

    res.json({
      data: otherPackagesUploadedBy,
    });
  } catch (error) {
    next(error);
  }
};

const getAllBookmarkedPackages = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user by userId and populate the bookmarkedPackages field
    const user = await User.findById(userId).populate("bookmarkedPackages");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bookmarkedPackages = user.bookmarkedPackages.map((trippackage) => {
      const createdAt = new Date(trippackage.createdAt);
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
        ...trippackage.toObject(),
        formattedCreatedAt: formattedTime,
        isBookmarked: true, // Since it's a bookmarked trippackage, set isBookmarked to true
      };
    });

    res.status(200).json({ data: bookmarkedPackages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get packages uploaded by current user
const getPackagesUploadedByCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const packages = await Package.find({ "user.id": userId }).sort({
      createdAt: -1,
    });

    res.json({
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};

let uploadedFilename; // Shared variable to store the uploaded filename

/* istanbul ignore next */
const uploadPackageCover = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a file" });
    }

    // Save the trippackage cover image and get the filename
    const filename = req.file.filename;

    uploadedFilename = filename; // Store the filename in the shared variable

    res.status(200).json({ success: true, data: filename });
  } catch (error) {
    next(error);
  }
};

const createPackage = async (req, res, next) => {
  const {
    destination_name,
    package_name,
    package_description,
    package_time,
    location,
    price,
    remaining,
    route,
    package_plan,
    reviews_and_ratings,
  } = req.body;
  const user = req.user;

  // Use the uploadedFilename from the shared variable
  const package_cover = uploadedFilename || "";

  try {
    if (
      !destination_name ||
      !package_name ||
      !package_description ||
      !package_time ||
      !location ||
      !price ||
      !package_cover ||
      !remaining ||
      !route ||
      !package_plan
    ) {
      return res
        .status(400)
        .json({ error: "Please fill in all required fields" });
    }

    const packageData = {
      destination_name,
      package_name,
      package_description,
      package_time,
      location,
      price,
      package_cover,
      remaining,
      route,
      package_plan,
      package_cover,
      reviews_and_ratings: reviews_and_ratings || [],
      user: user,
    };

    const packageInstance = await Package.create(packageData);
    res.status(201).json(packageInstance);
  } catch (error) {
    next(error);
  }
};

const getPackageById = (req, res, next) => {
  Package.findById(req.params.package_id)
    .then((trippackage) => {
      if (!trippackage) {
        res.status(404).json({ error: "trippackage not found" });
      }
      res.json({
        data: [trippackage],
      });
    })
    .catch(next);
};

const updatePackageById = (req, res, next) => {
  Package.findByIdAndUpdate(
    req.params.package_id,
    { $set: req.body },
    { new: true }
  )
    .then((updated) => res.json(updated))
    .catch(next);
};

const deletePackageById = (req, res, next) => {
  Package.findByIdAndDelete(req.params.package_id)
    .then((reply) => res.status(204).end())
    .catch(next);
};

const searchPackages = (req, res, next) => {
  const { query } = req.query;

  Package.find({
    $or: [
      { destination_name: { $regex: query, $options: "i" } },
      { package_name: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
    ],
  })
    .then((packages) => {
      if (packages.length === 0) {
        // No packages found
        res.json({ message: "No packages found" });
      } else {
        // Matching packages found
        res.json({
          data: packages,
        });
      }
    })
    .catch((error) => {
      next(error);
    });
};

const bookmarkPackage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const packageId = req.params.package_id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.bookmarkedPackages.includes(packageId)) {
      return res.status(400).json({ error: "Package is already bookmarked" });
    }

    user.bookmarkedPackages.push(packageId);
    await user.save();

    res.status(201).json({ message: "Package bookmarked successfully" });
  } catch (error) {
    next(error);
  }
};

const removeBookmark = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const packageId = req.params.package_id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.bookmarkedPackages.includes(packageId)) {
      return res.status(400).json({ error: "Package is not bookmarked" });
    }

    user.bookmarkedPackages = user.bookmarkedPackages.filter(
      (bookmark) => bookmark.toString() !== packageId
    );
    await user.save();

    res.json({ message: "Bookmark removed successfully" });
  } catch (error) {
    next(error);
  }
};

const addReviewToPackage = async (req, res, next) => {
  const userId = req.user.id;
  const packageId = req.params.package_id;
  const { review, ratings } = req.body;

  try {
    const trippackage = await Package.findById(packageId);

    if (!trippackage) {
      return res.status(404).json({ error: "Package not found" });
    }

    // Check if the user has already reviewed this trippackage
    const existingReview = trippackage.reviews_and_ratings.find(
      (r) => r.user_id.toString() === userId
    );

    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this trippackage" });
    }

    // Add the new review to the trippackage
    const newReview = {
      package_id: packageId,
      review: review,
      ratings: ratings,
      user_id: userId,
    };

    trippackage.reviews_and_ratings.push(newReview);

    await trippackage.save();

    res
      .status(201)
      .json({ message: "Review added successfully", reviewData: newReview });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPackages,
  getPackagesUploadedByOthers,
  getAllBookmarkedPackages,
  getPackagesUploadedByCurrentUser,
  uploadPackageCover,
  createPackage,
  getPackageById,
  updatePackageById,
  deletePackageById,
  searchPackages,
  bookmarkPackage,
  removeBookmark,
  addReviewToPackage,
};
