/**
 * Mobile Backend-for-Frontend (BFF) Service
 *
 * This Express.js application serves as a Backend-for-Frontend (BFF) for mobile clients.
 * It acts as an intermediary between mobile clients and backend services, providing JWT validation,
 * request transformations, and response filtering specific to mobile needs.
 *
 * Features:
 * - JWT authentication middleware
 * - Proxying book and customer service requests to backend services
 * - Mobile-specific transformations (e.g., replacing "non-fiction" with "3" in book genres)
 * - Error handling for backend service requests
 */

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { validateJWT } = require('./jwtHelper');

const app = express();
app.use(bodyParser.json());

// Configurations
const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || 'http://host.docker.internal:3000';
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://host.docker.internal:3000';

/**
 * Middleware to validate JWT tokens
 *
 * Ensures requests have a valid JWT token before proceeding.
 * Extracts the token from the Authorization header and validates it.
 * Attaches the user payload to the request object upon successful validation.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required' });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const validation = validateJWT(token);
  
  if (!validation.valid) {
    return res.status(401).json({ message: validation.error });
  }
  
  req.user = validation.payload;
  next();
};

/** Health check endpoint */
app.get('/status', (req, res) => {
  res.status(200).type('text/plain').send('OK');
});

/**
 * Book Management Endpoints
 * 
 * These endpoints handle book-related operations, including creating, updating,
 * and retrieving books while applying mobile-specific transformations.
 */

/**
 * Create a new book
 * Requires authentication
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
 * Update an existing book by ISBN
 * Requires authentication
 * Mobile-specific transformation: Converts "non-fiction" genre to "3"
 */
app.put('/books/:ISBN', authMiddleware, async (req, res) => {
  try {
    const response = await axios.put(`${BOOK_SERVICE_URL}/books/${req.params.ISBN}`, req.body);
    let data = JSON.parse(JSON.stringify(response.data));
    if (typeof data === 'object' && data.genre === 'non-fiction') {
      data.genre = '3';
    } else if (typeof data === 'string') {
      data = data.replace(/non-fiction/g, '3');
    }
    res.status(response.status).json(response.data);
  } catch (error) {
    handleAxiosError(error, res);
  }
});

/**
 * Retrieve book details by ISBN
 * Requires authentication
 * Mobile-specific transformation: Converts "non-fiction" genre to "3"
 */
app.get('/books/isbn/:ISBN', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${BOOK_SERVICE_URL}/books/${req.params.ISBN}`);
    let data = JSON.parse(JSON.stringify(response.data));
    if (typeof data === 'object' && data.genre === 'non-fiction') {
      data.genre = 3; // Set as number instead of string
    } else if (typeof data === 'string') {
      data = data.replace(/non-fiction/g, 3);
    }
    res.status(response.status).json(data);
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
 * Customer Management Endpoints
 * 
 * These endpoints handle customer-related operations while filtering out address fields
 * in responses to protect user privacy on mobile clients.
 */

/**
 * Create a new customer
 * Requires authentication
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
 * Requires authentication
 * Mobile-specific transformation: Removes address fields
 */
app.get('/customers/:id', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${CUSTOMER_SERVICE_URL}/customers/${req.params.id}`);
    if (response.data) {
      const { address, address2, city, state, zipcode, ...filteredData } = response.data;
      res.status(response.status).json(filteredData);
    } else {
      res.status(response.status).json(response.data);
    }
  } catch (error) {
    handleAxiosError(error, res);
  }
});

/**
 * Handle errors from Axios requests
 * Provides consistent error handling for backend service calls.
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

// Start server
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Mobile BFF service running on port ${PORT}`);
});

module.exports = app;