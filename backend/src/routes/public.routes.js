const router = require('express').Router();
const { submitDeletionRequest } = require('../controllers/deletion.controller');

router.post('/deletion-requests', submitDeletionRequest);

module.exports = router;
