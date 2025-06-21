const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, password, address, role = 'user' } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );
    
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async getAll(filters = {}) {
    let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    const params = [];

    if (filters.name) {
      query += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }
    if (filters.email) {
      query += ' AND email LIKE ?';
      params.push(`%${filters.email}%`);
    }
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters.address) {
      query += ' AND address LIKE ?';
      params.push(`%${filters.address}%`);
    }

    query += ' ORDER BY created_at DESC';
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    return true;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getTotalCount() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM users');
    return rows[0].count;
  }
}

module.exports = User;
