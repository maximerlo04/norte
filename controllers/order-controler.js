import { OrderError } from "../models/order.js";

function validateItems (items){
    if(!Array.isArray(items) || items.length === 0){
        return 'El carrito esta vacio'
    }

    for (const item of items){
        if(typeof item.product_id === 'string'){
            return 'Producto invalido'
        }
        if(!Number.isInteger(item.quantity) || item.quantity < 1){
            return 'La cantidad tiene que ser mayor o igual que 1'
        }
    }

    return null
}

export class orderController {
    constructor({orderModel}){
        this.orderModel = orderModel
    }

    create = async (req,res)=>{
        const {items} = req.body;
        const error = validateItems(items)
        
        if(error) return res.status(400).json({error})

        try{
            const order = await this.orderModel.create({userId: req.user.id, items})
            res.status(201).json(order)
        } catch(e){
            if( e instanceof OrderError){
                return res.status(e.status).json({error: e.message})
            }
            console.error(e)
            res.status(500).json({ error: 'No se pudo crear la orden' })
        }
    }

    showMine = async (req,res)=>{
        if(!req.user) return res.redirect('/login')

        try{
            const orders = await this.orderModel.getByUser({userId: req.user.id})
            res.render('order', {orders})
        } catch(e){
            console.error(e)
            res.status(500).send('Error al cargar tus órdenes')
        }
    }

    statusUpdate = async (req,res)=>{
        const {status} = req.body
        const allowed = ['pending','paid','shipped']

        if(!allowed.includes(status)){
            return res.status(400).json({ error: 'Estado inválido' })
        }

        try{
            const updated = await this.orderModel.statusUpdate({id: req.params.id, status})
            if(!updated) return res.status(404).json({ error: 'Orden no encontrada' })
            res.json({message: 'Estado actualizado'})
        } catch(e){
            console.error(e)
            res.status(500).json({error: 'No se pudo actualizar el estado'})
        }
    }
}