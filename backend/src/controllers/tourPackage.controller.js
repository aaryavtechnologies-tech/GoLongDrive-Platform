const TourPackage = require('../models/TourPackage.model');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Create a new tour package (Admin)
// @route   POST /api/tour-packages
// @access  Private (Admin)
exports.createPackage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title,
      description,
      days,
      nights,
      includes,
      excludes,
      imageUrl,
      destinations,
      pricing,
      isActive,
    } = req.body;

    const newPackage = await TourPackage.create({
      title,
      description,
      days,
      nights,
      includes,
      excludes,
      imageUrl,
      destinations,
      pricing,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: 'Tour package created successfully',
      data: newPackage,
    });
  } catch (error) {
    logger.error(`Error in createPackage: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error while creating package.' });
  }
};

// @desc    Get all tour packages
// @route   GET /api/tour-packages
// @access  Public
exports.getAllPackages = async (req, res) => {
  try {
    // If admin, return all, otherwise only active
    const filter = req.user?.role === 'admin' ? {} : { isActive: true };
    const packages = await TourPackage.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    logger.error(`Error in getAllPackages: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error while fetching packages.' });
  }
};

// @desc    Get single tour package
// @route   GET /api/tour-packages/:id
// @access  Public
exports.getPackageById = async (req, res) => {
  try {
    const tourPackage = await TourPackage.findById(req.params.id);
    
    if (!tourPackage) {
      return res.status(404).json({ success: false, message: 'Tour package not found' });
    }

    // If not admin, hide inactive packages
    if (!tourPackage.isActive && req.user?.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Tour package not found' });
    }

    res.status(200).json({
      success: true,
      data: tourPackage,
    });
  } catch (error) {
    logger.error(`Error in getPackageById: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error while fetching package.' });
  }
};

// @desc    Update a tour package (Admin)
// @route   PUT /api/tour-packages/:id
// @access  Private (Admin)
exports.updatePackage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let tourPackage = await TourPackage.findById(req.params.id);
    
    if (!tourPackage) {
      return res.status(404).json({ success: false, message: 'Tour package not found' });
    }

    tourPackage = await TourPackage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Tour package updated successfully',
      data: tourPackage,
    });
  } catch (error) {
    logger.error(`Error in updatePackage: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error while updating package.' });
  }
};

// @desc    Delete a tour package (Admin)
// @route   DELETE /api/tour-packages/:id
// @access  Private (Admin)
exports.deletePackage = async (req, res) => {
  try {
    const tourPackage = await TourPackage.findById(req.params.id);
    
    if (!tourPackage) {
      return res.status(404).json({ success: false, message: 'Tour package not found' });
    }

    await tourPackage.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Tour package deleted successfully',
    });
  } catch (error) {
    logger.error(`Error in deletePackage: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error while deleting package.' });
  }
};

// @desc    Suggest a custom tour (User)
// @route   POST /api/tour-packages/suggest
// @access  Private (Customer)
exports.suggestCustomTour = async (req, res) => {
  try {
    const { destinations, days, preferredVehicle, budget, notes } = req.body;
    
    // We could store this in a CustomTourSuggestion collection or just email it.
    // For now, let's just log it and send success. 
    // Ideally, we'd have a SuggestionModel.
    logger.info(`Custom tour suggestion received from user ${req.user.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Your suggestion has been received. Our team will contact you shortly.',
    });
  } catch (error) {
    logger.error(`Error in suggestCustomTour: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
