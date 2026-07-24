// src/models/Role.model.js

const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    isSystem: {
      type: Boolean,
      default: false, // System roles (e.g., Super Admin) cannot be deleted
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission',
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
