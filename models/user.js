import crypto from 'node:crypto'
import {pool} from '../db/connection.js'

export class UserModels {
    static async findByUserName ({username}){
        const [rows] = await pool.query(`
            SELECT BIN_TO_UUID(id) AS id, username, password, role FROM users WHERE username = ?
        `, [username])
        return rows[0]
    }

    static async create ({username, passwordHash}){
        const id = crypto.randomUUID();

        await pool.query(`
            INSERT INTO users (id, username, password) VALUES (UUID_TO_BIN(?),?,?)
        `, [id, username, passwordHash])

        return id
    }
    
}