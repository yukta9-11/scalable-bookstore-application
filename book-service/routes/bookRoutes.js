const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { validateBook } = require('../validation/bookValidation');

// Add book
router.post('/books', validateBook, bookController.createBook);

// Update book
router.put('/books/:ISBN', validateBook, bookController.updateBook);

// Get book by ISBN
router.get('/books/:ISBN', bookController.getBookByISBN);
router.get('/books/isbn/:ISBN', bookController.getBookByISBN);

router.get('/books/:ISBN/related-books', bookController.getRelatedBooks);


module.exports = router;