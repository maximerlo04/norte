import {pool} from '../db/connection.js'
import crypto from 'node:crypto'

export class productModel {
    static async getAll() {
        const [rows] = await pool.query(
            `SELECT BIN_TO_UUID(id) AS id, name, description, price, stock, image_url AS image FROM products`
        )
        return rows
    }
    static async getById({id}){
        const [rows] = await pool.query(
            `SELECT BIN_TO_UUID(id) AS id, name, description, price, stock,
                    image_url AS image
            FROM products
            WHERE id = UUID_TO_BIN(?)`, [id]
        )
        return rows[0];
    }

    static async create ({name,description,price,stock,image_url}){
        const id = crypto.randomUUID()

        await pool.query (`
            INSERT INTO products (id, name, description, price, stock, image_url)
            VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?)    
        `, [id, name, description || null, price, stock, image_url || null])

        return id
    }

    static async update ({id, data}){
        const allowed = ['name', 'description', 'price', 'stock', 'image_url']
        const fields = Object.keys(data).filter(key=> allowed.includes(key))

        if(fields.length === 0) return false

        const setClause = fields.map(field => `${field} = ? `).join(', ')
        const values = fields.map(field => data[field])

        const [result] = await pool.query(`
            UPDATE products SET ${setClause} WHERE id = UUID_TO_BIN(?)        
        `, [...values, id])

        return result.affectedRows > 0
    }

    static async delete ({id}){
        const [result] = await pool.query(`
            DELETE FROM products WHERE id = UUID_TO_BIN(?)        
        `, id)

        return result.affectedRows > 0
    }
}