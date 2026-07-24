// src/models/Cms.model.js

const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    metaTitle: String,
    metaDescription: String,
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Unique already creates an index for slug

module.exports = mongoose.model('Cms', cmsSchema);
