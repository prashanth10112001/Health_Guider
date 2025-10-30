const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    ethnicity: { type: String },
    email: { type: String, required: true, unique: true },

    questionnaire: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    health_issues: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("User", userSchema);
