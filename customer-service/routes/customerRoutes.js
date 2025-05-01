const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { validateCustomer } = require('../validation/customerValidation');

// Add customer
router.post('/customers', validateCustomer, customerController.createCustomer);

// Get customer by ID
router.get('/customers/:id' , customerController.getCustomerById);

// Get customer by userId
router.get('/customers' ,customerController.getCustomerByUserId);

module.exports = router;