const db = require('../config/db');

class Book {
  static async create(bookData) {
    const query = `
      INSERT INTO books (ISBN, title, Author, description, genre, price, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      bookData.ISBN,
      bookData.title,
      bookData.Author,
      bookData.description,
      bookData.genre,
      bookData.price,
      bookData.quantity
    ]);
    
    return bookData;
  }
  
  static async findByISBN(isbn) {
    const query = `SELECT * FROM books WHERE ISBN = ?`;
    const [rows] = await db.execute(query, [isbn]);
    return rows[0];
  }
  
  static async update(isbn, bookData) {
    const query = `
      UPDATE books
      SET title = ?, Author = ?, description = ?, genre = ?, price = ?, quantity = ?
      WHERE ISBN = ?
    `;
    
    const [result] = await db.execute(query, [
      bookData.title,
      bookData.Author,
      bookData.description,
      bookData.genre,
      bookData.price,
      bookData.quantity,
      isbn
    ]);
    
    return result.affectedRows > 0;
  }
}

module.exports = Book;