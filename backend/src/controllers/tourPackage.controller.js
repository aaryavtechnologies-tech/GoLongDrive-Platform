const TourPackage = require('../models/TourPackage.model');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const { seedTourPackages } = require('../seeds/seedTourPackages');

const parseArray = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return field.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const parseNumber = (val, defaultVal = 0) => {
  if (val === undefined || val === null || val === '') return defaultVal;
  const num = Number(val);
  return isNaN(num) ? defaultVal : num;
};

// @desc    Upload tour package image (Admin)
// @route   POST /api/v1/tour-packages/upload-image
// @access  Private (Admin)
exports.uploadPackageImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }
    const fileUrl = `/uploads/tour-packages/${req.file.filename}`;
    return res.status(200).json({ success: true, url: fileUrl });
  } catch (error) {
    logger.error(`Error in uploadPackageImage: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new tour package (Admin)
// @route   POST /api/v1/tour-packages
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
      price,
      numberOfPersons,
      pricePerPerson,
      route,
      placesToExplore,
      includes,
      excludes,
      destinations,
      pricing,
      isActive,
    } = req.body;

    let finalImageUrl = req.body.imageUrl || '';
    if (req.file) {
      finalImageUrl = `/uploads/tour-packages/${req.file.filename}`;
    }

    const numDays = parseNumber(days, 1);
    const numNights = nights !== undefined && nights !== null ? parseNumber(nights, 0) : (numDays > 1 ? numDays - 1 : 0);
    const numPrice = parseNumber(price, 0);
    const numPersons = parseNumber(numberOfPersons, 1);
    const numPerPerson = pricePerPerson ? parseNumber(pricePerPerson, 0) : (numPersons > 0 ? Math.round(numPrice / numPersons) : 0);

    const newPackage = await TourPackage.create({
      title,
      description,
      days: numDays,
      nights: numNights,
      price: numPrice,
      numberOfPersons: numPersons,
      pricePerPerson: numPerPerson,
      route: route || '',
      placesToExplore: parseArray(placesToExplore),
      includes: parseArray(includes),
      excludes: parseArray(excludes),
      imageUrl: finalImageUrl,
      destinations: destinations ? (typeof destinations === 'string' ? JSON.parse(destinations) : destinations) : [],
      pricing: pricing ? (typeof pricing === 'string' ? JSON.parse(pricing) : pricing) : [],
      isActive: isActive === undefined ? true : (isActive === true || isActive === 'true'),
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
// @route   GET /api/v1/tour-packages
// @access  Public
exports.getAllPackages = async (req, res) => {
  try {
    // If admin or specifically requested, allow all, otherwise default to active
    let filter = {};
    if (req.query.all !== 'true' && req.user?.role !== 'admin') {
      filter.isActive = true;
    }

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
// @route   GET /api/v1/tour-packages/:id
// @access  Public
exports.getPackageById = async (req, res) => {
  try {
    const tourPackage = await TourPackage.findById(req.params.id);
    
    if (!tourPackage) {
      return res.status(404).json({ success: false, message: 'Tour package not found' });
    }

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
// @route   PUT /api/v1/tour-packages/:id
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

    const updateData = { ...req.body };

    if (req.file) {
      updateData.imageUrl = `/uploads/tour-packages/${req.file.filename}`;
    }

    if (updateData.placesToExplore !== undefined) {
      updateData.placesToExplore = parseArray(updateData.placesToExplore);
    }
    if (updateData.includes !== undefined) {
      updateData.includes = parseArray(updateData.includes);
    }
    if (updateData.excludes !== undefined) {
      updateData.excludes = parseArray(updateData.excludes);
    }
    if (updateData.days !== undefined) {
      updateData.days = parseNumber(updateData.days, tourPackage.days);
    }
    if (updateData.nights !== undefined) {
      updateData.nights = parseNumber(updateData.nights, tourPackage.nights);
    }
    if (updateData.price !== undefined) {
      updateData.price = parseNumber(updateData.price, tourPackage.price);
    }
    if (updateData.numberOfPersons !== undefined) {
      updateData.numberOfPersons = parseNumber(updateData.numberOfPersons, tourPackage.numberOfPersons);
    }
    if (updateData.pricePerPerson !== undefined) {
      updateData.pricePerPerson = parseNumber(updateData.pricePerPerson, tourPackage.pricePerPerson);
    }
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === true || updateData.isActive === 'true';
    }

    tourPackage = await TourPackage.findByIdAndUpdate(req.params.id, updateData, {
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
// @route   DELETE /api/v1/tour-packages/:id
// @access  Private (Admin)
exports.deletePackage = async (req, res) => {
  try {
    const tourPackage = await TourPackage.findById(req.params.id);
    
    if (!tourPackage) {
      return res.status(404).json({ success: false, message: 'Tour package not found' });
    }

    // Try to remove local image if it exists
    if (tourPackage.imageUrl && tourPackage.imageUrl.startsWith('/uploads/tour-packages/')) {
      const filePath = path.join(__dirname, '../../', tourPackage.imageUrl);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) {}
      }
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
// @route   POST /api/v1/tour-packages/suggest
// @access  Private (Customer)
exports.suggestCustomTour = async (req, res) => {
  try {
    const { destinations, days, preferredVehicle, budget, notes } = req.body;
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

// @desc    Seed default tour packages (Admin)
// @route   POST /api/v1/tour-packages/seed
// @access  Private (Admin)
exports.seedPackages = async (req, res) => {
  try {
    const force = req.query.force === 'true' || req.body.force === true;
    const result = await seedTourPackages(force);
    res.status(200).json({
      success: true,
      message: result.message,
      count: result.count,
    });
  } catch (error) {
    logger.error(`Error in seedPackages: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
