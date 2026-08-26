// src/controllers/admin.vehicle.controller.js
const VehicleType = require('../models/VehicleType.model.js');

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleType.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Return relative URL or full URL. The multer config usually returns req.file.path or similar.
    // In Express with static serving, it's usually /uploads/vehicles/filename
    // Let's assume standard uploads/ format.
    const fileUrl = `/uploads/vehicles/${req.file.filename}`;
    res.status(200).json({ success: true, url: fileUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleType.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleType.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
