const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Book = require("./Package");
const BookingRequest = require("./BookingRequest");

const userSchema = new Schema({
  userType: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  bio: {
    type: String,
    default: "",
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  bookingRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookingRequest",
    },
  ],
  bookmarkedPackages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
  ],
});

// set toJSON method to not to return hashed password
userSchema.set("toJSON", {
  transform: (document, returnedDocument) => {
    returnedDocument.id = document._id.toString();
    delete returnedDocument._id;
    // delete returnedDocument.password;
    delete returnedDocument.__v;
  },
});

module.exports = mongoose.model("User", userSchema);
