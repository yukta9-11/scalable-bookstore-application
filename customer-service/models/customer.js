const db = require('../config/db');

class Customer {
  static async create(customerData) {
    const query = `
      INSERT INTO customers (userId, name, phone, address, address2, city, state, zipcode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      customerData.userId,
      customerData.name,
      customerData.phone,
      customerData.address,
      customerData.address2 || null,
      customerData.city,
      customerData.state,
      customerData.zipcode
    ]);
    
    return {
      id: result.insertId,
      ...customerData
    };
  }
  
  static async findById(id) {
    const query = `SELECT * FROM customers WHERE id = ?`;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }
  
  static async findByUserId(userId) {
    const query = `SELECT * FROM customers WHERE userId = ?`;
    const [rows] = await db.execute(query, [userId]);
    return rows[0];
  }
}

module.exports = Customer;