import crypto from 'node:crypto'
import {pool} from '../db/connection.js' 

function groupOrders(rows){
    const orders = new Map()

    for(const row of rows){
        if(!orders.has(row.order_id)){
            orders.set(row.order_id, {
                id: row.order_id,
                username: row.username,
                status: row.status,
                total: row.total,
                createdAt: row.created_at,
                items: []
            })
        }
        orders.get(row.order_id).items.push({
            name: row.name,
            quantity: row.quantity,
            unitPrice: row.unit_price
        })
    }

    return [...orders.values()]
}

export class OrderError extends Error{
    constructor (status,message) {
        super(message)
        this.status = status
    }
}

export class OrderModels {

    static async create({userId, items}){
        const connection = await pool.getConnection()

        try{
            await connection.beginTransaction()

            let total = 0;
            const lines = []

            for (const item of items){
                // FOR UPDATE bloquea la fila hasta terminar la transacción,
                // así dos compras simultáneas no se pisan el stock
                const [rows] = await connection.query(`
                    SELECT BIN_TO_UUID(id) AS id, name, price, stock FROM products 
                    WHERE id = UUID_TO_BIN(?)
                    FOR UPDATE`, [item.productId])
                
                const product = rows[0]

                if(!product){
                    throw new OrderError(404, 'Uno de los productos no existe')
                }

                if (product.stock < item.quantity){
                    throw new OrderError(404, 'No hay mas stock del producto')
                }

                total += product.price * item.quantity
                lines.push({productId: product.id, quantity: item.quantity, unitPrice: product.price})
            }

            total = Math.round(total * 100) / 100;

            const orderId = crypto.randomUUID()

            await connection.query(`
                INSERT INTO orders (id, user_id, total)
                VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?)
            `, [orderId, userId, total])

            for(const line of lines){
                await connection.query(`
                    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                    VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?)    
                `, [orderId, line.productId, line.quantity, line.unitPrice])

                await connection.query(`
                    UPDATE products SET stock = stock - ? WHERE id = UUID_TO_BIN(?)        
                `, [line.quantity, line.productId])
            }

            await connection.commit()
            return {id: orderId, total}
        } catch(e){
            await connection.rollback()
            throw e
        } finally{
            connection.release()
        }
    }

    static async getByUser ({userId}){
        const [rows] = await pool.query(`
            SELECT BIN_TO_UUID(o.id) AS order_id, o.status, o.total, o.created_at,
            p.name, oi.quantity, oi.unit_price
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            JOIN products p ON p.id = oi.product_id
            WHERE o.user_id = UUID_TO_BIN(?)
            ORDER BY o.created_at DESC   
        `, [userId])
        
        return groupOrders(rows)
    }

    static async getAll (){
        const [rows] = await pool.query(`
            SELECT BIN_TO_UUID(o.id) AS order_id, u.username, o.status, o.total, o.created_at,
            p.name, oi.quantity, oi.unit_price
            FROM orders o
            JOIN users u ON u.id = o.user_id
            JOIN order_items oi ON oi.order_id = o.id
            JOIN products p ON p.id = oi.product_id
            ORDER BY o.created_at DESC        
        `)

        return groupOrders(rows)
    }

    static async statusUpdate({id, status}){
        const [result] = await pool.query(`
            UPDATE orders SET status = ? WHERE id = UUID_TO_BIN(?)        
        `, [status, id])

        return result.affectedRows > 0
    }
}