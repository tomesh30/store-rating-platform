const db = require('../config/database');

class Store {
  static async create(storeData) {
    const { name, email, address, owner_id } = storeData;
    
    const [result] = await db.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id]
    );
    
    return result.insertId;
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT s.*, 
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s 
      LEFT JOIN ratings r ON s.id = r.store_id 
      WHERE 1=1
    `;
    const params = [];

    if (filters.name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${filters.name}%`);
    }
    if (filters.address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${filters.address}%`);
    }
    if (filters.email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${filters.email}%`);
    }

    query += ' GROUP BY s.id ORDER BY s.created_at DESC';
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(`
      SELECT s.*, 
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s 
      LEFT JOIN ratings r ON s.id = r.store_id 
      WHERE s.id = ?
      GROUP BY s.id
    `, [id]);
    return rows[0];
  }

  static async findByOwnerId(ownerId) {
    const [rows] = await db.execute(`
      SELECT s.*, 
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s 
      LEFT JOIN ratings r ON s.id = r.store_id 
      WHERE s.owner_id = ?
      GROUP BY s.id
    `, [ownerId]);
    return rows[0];
  }

  static async getTotalCount() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM stores');
    return rows[0].count;
  }

  static async getStoreRaters(storeId) {
    const [rows] = await db.execute(`
      SELECT u.name, u.email, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [storeId]);
    return rows;
  }
}

module.exports = Store;