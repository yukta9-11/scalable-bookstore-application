const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

// Status endpoint
router.get('/status', statusController.getStatus);

module.exports = router;