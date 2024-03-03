const mongoose = require("mongoose");

const exchangeRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.Mixed,
    ref: "User",
    required: true,
  },
  requestedPackage: {
    type: mongoose.Schema.Types.Mixed,
    ref: "Package",
    required: true,
  },
  requestedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contactNum: {
    type: String,
    required: true,
  },
  furtherRequirements: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  statusUpdatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ExchangeRequest = mongoose.model(
  "ExchangeRequest",
  exchangeRequestSchema
);

module.exports = ExchangeRequest;
