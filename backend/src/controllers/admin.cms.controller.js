// src/controllers/admin.cms.controller.js

const Cms = require('../models/Cms.model');
const { sendSuccess } = require('../helpers/response.helper');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/admin/cms
 * @access  Private (Admin)
 */
const getAllPages = asyncHandler(async (req, res) => {
  const pages = await Cms.find().sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'CMS pages fetched', { pages });
});

/**
 * @route   GET /api/admin/cms/:slug
 * @access  Public
 */
const getPageBySlug = asyncHandler(async (req, res) => {
  const page = await Cms.findOne({ slug: req.params.slug, isPublished: true });
  if (!page) throw ApiError.notFound('Page not found');
  return sendSuccess(res, 200, 'Page fetched', { page });
});

/**
 * @route   POST /api/admin/cms
 * @access  Private (Admin)
 */
const createPage = asyncHandler(async (req, res) => {
  const page = await Cms.create(req.body);
  return sendSuccess(res, 201, 'Page created', { page });
});

/**
 * @route   PUT /api/admin/cms/:id
 * @access  Private (Admin)
 */
const updatePage = asyncHandler(async (req, res) => {
  const page = await Cms.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!page) throw ApiError.notFound('Page not found');
  return sendSuccess(res, 200, 'Page updated', { page });
});

/**
 * @route   DELETE /api/admin/cms/:id
 * @access  Private (Admin)
 */
const deletePage = asyncHandler(async (req, res) => {
  const page = await Cms.findByIdAndDelete(req.params.id);
  if (!page) throw ApiError.notFound('Page not found');
  return sendSuccess(res, 200, 'Page deleted');
});

module.exports = {
  getAllPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage
};
