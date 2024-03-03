const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const BookingRequest = require("../models/BookingRequest");

const registerUser = async (req, res, next) => {
  const { username, password, fullname, email } = req.body;

  try {
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ error: "Duplicate username" });
    }

    if (!username || !password || !fullname || !email) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    if (!email.includes("@") || !email.includes(".")) {
      return res.status(400).json({ error: "Please enter a valid email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      fullname,
      email,
    });

    res.status(201).json({ status: "success", message: "User created" });
  } catch (error) {
    /* istanbul ignore next */
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ error: "User is not registered" });
    }

    if (!username || !password) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Password does not match" });
    }

    const payload = {
      id: user._id,
      username: user.username,
      fullname: user.fullname,
    };

    jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) {
        /* istanbul ignore next */
        return res.status(500).json({ error: err.message });
      }
      res.json({ status: "success", token: token });
    });
  } catch (error) {
    /* istanbul ignore next */
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      data: [user],
    });
  } catch (error) {
    /* istanbul ignore next */
    next(error);
  }
};

const getUserInfoById = async (req, res, next) => {
  const userId = req.params.user_id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      /* istanbul ignore next */
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    /* istanbul ignore next */
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare the current password with the stored hashed password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ error: "New password and confirm password do not match" });
    }

    // Check if the new password is different from the current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        error: "New password must be different from the current password",
      });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedNewPassword;

    // Save the updated user
    await user.save();

    res.status(204).json({ message: "Password updated successfully" });
  } catch (error) {
    /* istanbul ignore next */
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  const userId = req.user.id;
  const { username, fullname, email, bio, phoneNumber } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the fields only if they are different from the existing values
    if (username && username !== "" && username !== user.username) {
      const existingUserWithUsername = await User.findOne({
        username: username,
      });
      if (existingUserWithUsername) {
        /* istanbul ignore next */
        return res.status(400).json({ error: "Username is already taken" });
      }
      user.username = username;
    }
    if (fullname && fullname !== "" && fullname !== user.fullname) {
      user.fullname = fullname;
    }
    if (email && email !== "" && email !== user.email) {
      const existingUserWithEmail = await User.findOne({ email: email });
      if (existingUserWithEmail) {
        /* istanbul ignore next */
        return res.status(400).json({ error: "Email is already taken" });
      }
      user.email = email;
    }
    if (bio !== undefined && bio !== user.bio) {
      user.bio = bio;
    }
    if (phoneNumber !== undefined && phoneNumber !== user.phoneNumber) {
      const existingUserWithPhoneNumber = await User.findOne({
        phoneNumber: phoneNumber,
      });
      if (existingUserWithPhoneNumber) {
        return res.status(400).json({ error: "Phone number is already taken" });
      }
      user.phoneNumber = phoneNumber;
    }

    // Save the updated user
    const updatedUser = await user.save();

    res.json({
      data: [updatedUser],
    });
  } catch (error) {
    /* istanbul ignore next */
    next(error);
  }
};

// Get all exchange requests for a user
const getAllExchangeRequests = async (req, res, next) => {
  try {
    const userId = req.params.user_id;

    const exchangeRequests = await BookingRequest.find({
      requester: userId,
    });

    res.json(exchangeRequests);
  } catch (error) {
    /* istanbul ignore next */
  }
};

/* istanbul ignore next */
const uploadImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file" });
  }

  // Update the user's profile picture in the database
  const userId = req.user.id;
  const image = req.file.filename;

  User.findByIdAndUpdate(userId, { image })
    .then(() => {
      res.status(200).json({
        success: true,
        data: image,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Failed to update the user's profile picture",
      });
    });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getUserInfoById,
  updateUserProfile,
  updatePassword,
  getAllExchangeRequests,
  uploadImage,
};
