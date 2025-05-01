const Book = require('../models/book');
const axios = require('axios'); 
const CircuitBreaker = require('../utils/circuitBreaker');

// Create a circuit breaker instance for the recommendation engine call.
// It uses the mounted volume file for persistence (/mnt/circuit-state/circuit.json).
const recommendationBreaker = new CircuitBreaker({
  filePath: '/mnt/circuit-state/circuit.json',
  timeout: 3000,         // 3-second timeout for external calls.
  resetTimeout: 60000    // 60-second timeout to retry once the circuit is open.
});

/**
 * @description Creates a new book in the system.
 * @route POST /books
 * @body {Object} bookData - The data of the book to be created
 * @bodyParam {string} title - The title of the book
 * @bodyParam {string} author - The author of the book
 * @bodyParam {string} ISBN - The ISBN of the book (unique identifier)
 * @bodyParam {number} price - The price of the book
 * @bodyParam {string} publisher - The publisher of the book
 * @bodyParam {string} publishedDate - The published date of the book (ISO 8601 format)
 * 
 * @returns {Object} 201 - The newly created book
 * @returns {string} 422 - If the ISBN already exists in the system
 * @returns {string} 500 - If there is an internal server error
 */
const createBook = async (req, res) => {
  try {
    const bookData = req.body;
    
    // Check if book already exists
    const existingBook = await Book.findByISBN(bookData.ISBN);
    if (existingBook) {
      return res.status(422).json({ message: 'This ISBN already exists in the system.' });
    }
    
    const newBook = await Book.create(bookData);
    newBook.price = Number(newBook.price);
    
    res.status(201)
      .header('Location', `${req.baseUrl}/books/${newBook.ISBN}`)
      .json(newBook);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @description Updates an existing book's details.
 * @route PUT /books/:ISBN
 * @param {string} ISBN - The ISBN of the book to be updated
 * @body {Object} bookData - The new data for the book
 * @bodyParam {string} title - The title of the book
 * @bodyParam {string} author - The author of the book
 * @bodyParam {string} ISBN - The ISBN of the book (must match the ISBN in the URL)
 * @bodyParam {number} price - The price of the book
 * @bodyParam {string} publisher - The publisher of the book
 * @bodyParam {string} publishedDate - The published date of the book (ISO 8601 format)
 * 
 * @returns {Object} 200 - The updated book details
 * @returns {string} 400 - If the ISBN in the body does not match the URL parameter
 * @returns {string} 404 - If the book with the given ISBN does not exist
 * @returns {string} 500 - If there is an internal server error
 */
const updateBook = async (req, res) => {
  try {
    const { ISBN } = req.params;
    const bookData = req.body;
    
    // Check if book exists
    const existingBook = await Book.findByISBN(ISBN);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Make sure the ISBN in the body matches the URL parameter
    if (bookData.ISBN !== ISBN) {
      return res.status(400).json({ message: 'ISBN in body does not match ISBN in URL' });
    }
    
    const updated = await Book.update(ISBN, bookData);
    if (updated) {
      const updatedBook = await Book.findByISBN(ISBN);
      updatedBook.price = Number(updatedBook.price);
      res.status(200).json(updatedBook);
    } else {
      res.status(500).json({ message: 'Failed to update book' });
    }
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @description Fetches a book by its ISBN.
 * @route GET /books/:ISBN
 * @param {string} ISBN - The ISBN of the book to be retrieved
 * 
 * @returns {Object} 200 - The book details
 * @returns {string} 404 - If the book with the given ISBN does not exist
 * @returns {string} 500 - If there is an internal server error
 */
const getBookByISBN = async (req, res) => {
  try {
    const { ISBN } = req.params;
    
    const book = await Book.findByISBN(ISBN);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    book.price = Number(book.price);
    res.status(200).json(book);
  } catch (error) {
    console.error('Error retrieving book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Retrieves related books by calling an external recommendation engine.
 * Uses the CircuitBreaker class to ensure a 3-second timeout.
 * - Returns 200 with recommendations if successful.
 * - Returns 204 if no recommendations found.
 * - Returns 504 if the external service times out.
 * - Returns 503 if the circuit breaker is open.
 */
const getRelatedBooks = async (req, res) => {
  const { ISBN } = req.params;
  console.log("getRelatedBooksHandler called for ISBN:", ISBN);

  try {
    const { ISBN } = req.params;
  
    const finalUrl = process.env.RECOMMENDATION_URL
    ? `${process.env.RECOMMENDATION_URL}/recommended-titles/isbn/${ISBN}`
    : `http://localhost:80/recommended-titles/isbn/${ISBN}`;
  
    // Use the circuit breaker to wrap the external call.
    const result = await recommendationBreaker.call(() =>
      axios.get(finalUrl)
    );
  
    const recommendations = result.data;
  
    if (!recommendations || recommendations.length === 0) {
      return res.sendStatus(204); // No related books found.
    }
  
    // Format and return the recommendations
    res.status(200).json(formatRecommendations(recommendations));
  
  } catch (error) {
    if (error.message === "Circuit is open") {
      return res.status(503).json({ error: 'Service unavailable (circuit breaker open)' });
    } else if (error.message === "Operation timed out") {
      return res.status(504).json({ error: 'External service timed out' });
    }
    console.error('Unexpected error in related books handler:', error);
    res.status(500).json({ error: 'Unexpected error', details: error.message });
  }
}

function formatRecommendations(data) {
  return data.map(book => ({
    ISBN: book.isbn,
    title: book.title,
    Author: book.authors
  }));
}
  

module.exports = {
  createBook,
  updateBook,
  getBookByISBN,
  getRelatedBooks
};
