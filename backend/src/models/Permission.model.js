// src/models/Permission.model.js

const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'read', 'update', 'delete', 'manage'], // manage implies full access
      trim: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

permissionSchema.index({ module: 1, action: 1 }, { unique: true });

module.exports = mongoose.model('Permission', permissionSchema);
