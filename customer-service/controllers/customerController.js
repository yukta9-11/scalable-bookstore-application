const Customer = require('../models/customer');
const { Kafka } = require('kafkajs');


// Kafka Producer Setup (shared across requests)
const kafka = new Kafka({
  clientId: 'customer-service',
  brokers: process.env.KAFKA_BROKERS.split(',')
});

const producer = kafka.producer();

// Connect the Kafka producer once when the app starts
(async () => {
  try {
    await producer.connect();
    console.log('Kafka producer connected successfully');
  } catch (err) {
    console.error('Kafka producer connection failed:', err);
  }
})();

/**
 * @description Creates a new customer in the system.
 * @route POST /customers
 * @body {Object} customerData - The data of the customer to be created
 * @bodyParam {string} userId - The user ID (unique identifier) for the customer
 * @bodyParam {string} name - The name of the customer
 * @bodyParam {string} email - The email of the customer
 * @bodyParam {string} phone - The phone number of the customer
 * @bodyParam {string} address - The address of the customer
 * 
 * @returns {Object} 201 - The newly created customer
 * @returns {string} 422 - If the user ID already exists in the system
 * @returns {string} 500 - If there is an internal server error
 */
const createCustomer = async (req, res) => {
  try {
    const customerData = req.body;

    // Check if userId already exists
    const existingCustomer = await Customer.findByUserId(customerData.userId);
    if (existingCustomer) {
      return res.status(422).json({ message: 'This user ID already exists in the system.' });
    }

    // Create new customer
    const newCustomer = await Customer.create(customerData);

    // Construct event payload (only the fields required by CRM)
    const eventPayload = {
      id: newCustomer.id,
      userId: newCustomer.userId,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address,
      address2: newCustomer.address2,
      city: newCustomer.city,
      state: newCustomer.state,
      zipcode: newCustomer.zipcode
    };

    // Send Kafka event
    await producer.send({
      topic: `${process.env.ANDREW_ID}.customer.evt`,
      messages: [{ value: JSON.stringify(eventPayload) }]
    });

    // Return full created customer object to client (same as before)
    res.status(201)
      .header('Location', `${req.baseUrl}/customers/${newCustomer.id}`)
      .json(newCustomer);

  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


/**
 * @description Retrieves a customer by their ID.
 * @route GET /customers/:id
 * @param {string} id - The ID of the customer to be retrieved
 * 
 * @returns {Object} 200 - The customer details
 * @returns {string} 400 - If the ID format is invalid
 * @returns {string} 404 - If the customer with the given ID does not exist
 * @returns {string} 500 - If there is an internal server error
 */
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate id format
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ message: 'Invalid customer ID format' });
    }
    
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error retrieving customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @description Retrieves a customer by their user ID (email).
 * @route GET /customers?userId={userId}
 * @query {string} userId - The user ID (email) of the customer to be retrieved
 * 
 * @returns {Object} 200 - The customer details
 * @returns {string} 400 - If the userId query parameter is missing or invalid
 * @returns {string} 404 - If the customer with the given userId does not exist
 * @returns {string} 500 - If there is an internal server error
 */
const getCustomerByUserId = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Check if userId query parameter is provided
    if (!userId) {
      return res.status(400).json({ message: 'userId query parameter is required' });
    }

    // Validate email format for userId
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userId)) {
      return res.status(400).json({ message: 'userId must be a valid email address' });
    }
    
    const customer = await Customer.findByUserId(userId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error retrieving customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createCustomer,
  getCustomerById,
  getCustomerByUserId
};
