const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    destination_name: {
      type: String,
      required: true,
    },
    package_name: {
      type: String,
      required: true,
    },
    package_description: {
      type: String,
      required: true,
    },
    package_time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    remaining: {
      type: Number,
      required: true,
    },
    route: {
      type: String,
      required: true,
    },
    package_cover: {
      type: String,
      default: null,
    },
    package_plan: {
      type: String,
      required: true,
    },
    reviews_and_ratings: [
      {
        package_id: {
          type: String,
          required: true,
        },
        review: {
          type: String,
          required: true,
        },
        ratings: {
          type: Number,
          required: true,
        },
        user_id: {
          type: mongoose.Schema.Types.Mixed,
          ref: "User",
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.Mixed,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
