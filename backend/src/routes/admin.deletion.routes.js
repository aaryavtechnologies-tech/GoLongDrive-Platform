const router = require('express').Router();
const { getDeletionRequests, processDeletionRequest } = require('../controllers/deletion.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const isAdmin = [authenticate, requireRole(ROLES.ADMIN)];

router.use(isAdmin);

router.get('/', getDeletionRequests);
router.patch('/:id/process', processDeletionRequest);

module.exports = router;
