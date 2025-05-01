const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { validateJWT } = require('./jwtHelper');

const app = express();
app.use(bodyParser.json());

/**
 * Configuration
 * Defines the base URL for backend services, using an environment variable if available.
 */
const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || 'http://host.docker.internal:3000';
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://host.docker.internal:3000';


/**
 * Middleware to validate JWT token
 * Ensures all requests include a valid JWT token for authentication.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required' });
  }
  
  const token = authHeader.substring(7); // Extract token
  const validation = validateJWT(token);
  
  if (!validation.valid) {
    return res.status(401).json({ message: validation.error });
  }
  
  req.user = validation.payload;
  next();
};

/**
 * Status check endpoint
 * Returns 'OK' to indicate that the service is running.
 */
app.get('/status', (req, res) => {
  res.status(200).type('text/plain').send('OK');
});

/**
 * Book Endpoints
 */

/**
 * Create a new book entry
 */
app.post('/books', authMiddleware, async (req, res) => {
  try {
    const response = await axios.post(`${BOOK_SERVICE_URL}/books`, req.body);
    res.status(response.status)
       .header('Location', response.headers.location)
       .json(response.data);
  } catch (error) {
    handleAxiosError(error, res);
  }
});

/**
 * Update a book's details by ISBN
 */
app.put('/books/:ISBN', authMiddleware, async (req, res) => {
  try {
    const response = await axios.put(`${BOOK_SERVICE_URL}/books/${req.params.ISBN}`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    handleAxiosError(error, res);
  }
});

/**
 * Retrieve book details by ISBN
 */
app.get('/books/isbn/:ISBN', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${BOOK_SERVICE_URL}/books/${req.params.ISBN}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    handleAxiosError(error, res);
  }
});

/**
 * General book retrieval endpoint
 */
app.get('/books/:ISBN', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${BOOK_SERVICE_URL}/books/${req.params.ISBN}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    handleAxiosError(error, res);
  }
});



/**
 * Retrieve related books for a given ISBN
 * Route: /books/:ISBN/related-books
 * Requires authentication
 */
app.get('/books/:ISBN/related-books', authMiddleware, async (req, res) => {
  const { ISBN } = req.params;
  
  try {
    const response = await axios.get(`${BOOK_SERVICE_URL}/books/${ISBN}/related-books`);
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      // Forward backend's status code and error response
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      console.error('No response received from backend:', error.request);
      res.status(500).json({ message: 'No response from backend service' });
    } else {
      console.error('Request setup error:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});


/**
 * Customer Endpoints
 */

/**
 * Create a new customer entry
 */
app.post('/customers', authMiddleware, async (req, res) => {
  try {
    const response = await axios.post(`${CUSTOMER_SERVICE_URL}/customers`, req.body);
    res.status(response.status)
       .header('Location', response.headers.location)
       .json(response.data);
  } catch (error) {
    handleAxiosError(error, res);
  }
});

/**
 * Retrieve customer details by ID
 */
app.get('/customers/:id', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${CUSTOMER_SERVICE_URL}/customers/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    handleAxiosError(error, res);
  }
});

/**
 * Retrieve all customers with optional query parameters
 */
app.get('/customers', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${CUSTOMER_SERVICE_URL}/customers`, {
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    handleAxiosError(error, res);
  }
});

/**
 * Handles errors from Axios requests
 * Provides meaningful error responses to clients.
 */
function handleAxiosError(error, res) {
  if (error.response) {
    res.status(error.response.status).json(error.response.data);
  } else if (error.request) {
    console.error('No response received:', error.request);
    res.status(500).json({ message: 'No response from backend service' });
  } else {
    console.error('Error setting up request:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Start the server on the defined port
 */
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Web BFF service running on port ${PORT}`);
});

module.exports = app;