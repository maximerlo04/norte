
function validateProducts (data, {partial = false} = {}){
    const {name, price, stock} = data

    if(!partial || name !== undefined){
        if(typeof name !== 'string' || name.trim().length === 0){
            return 'El nombre es obligatorio'
        }
    }
    if(!partial || price !== undefined){
        if(typeof price !== 'number' || price < 0){
            return 'El precio tiene que ser un numero mayor o igual que 0'
        }
    }
    if(!partial || stock !== undefined){
        if(!Number.isInteger(stock) || stock < 0){
            return 'El stock tiene que ser un numero mayor o igual que 0'
        }
    }
    return null
}

export class productController {
    constructor({productModel}) {
        this.productModel = productModel
    }

    showCatalog = async (req, res) =>{
        try{
            const products = await this.productModel.getAll()
            res.render('catalog', {products})
        } catch(e){
            console.error(e)
            return res.status(500).send('Error al mandar catalogo')
        }
    }

    getAll = async (req,res) =>{
        try{
            const products = await this.productModel.getAll()
            res.json(products)
        } catch(e){
            console.error(e)
            res.status(500).json({error: 'Error al obtener los productos'})
        }
    }

    getById = async (req,res) =>{
        try{
            const products = await this.productModel.getById({id: req.params.id})
            if(!products) return res.status(401).json({error: 'Error al mostrar el producto'})
            res.json(products)
        } catch(e){
            console.error(e)
            res.status(500).json({ error: 'Error al obtener el producto' })
        }
    }

    create = async(req,res)=>{
        const error = validateProducts(req.body)
        if(error) return res.status(400).json({error})

        try{
            const id = await this.productModel.create(req.body)
            res.status(201).json({ id })
        } catch(e){
            console.error(e)    
            res.status(500).json({ error: 'No se pudo crear el producto' })
        }
    }

    update = async (req,res)=>{
        console.log('id:', req.params.id, 'body:', req.body)
        const error = validateProducts(req.body)
        if(error) return res.status(400).json({error})

        try{
            const updated = await this.productModel.update({id: req.params.id, data: req.body})
            if(!updated) return res.status(404).json({ error: 'Producto no encontrado' })
        } catch(e){
            console.error(e)
            res.status(500).json({ error: 'No se pudo actualizar el producto' })
        }
    }

    delete = async(req,res)=>{
        try{
            const deleted = await this.productModel.delete({id: req.params.id})
            if(!deleted) return res.status(404).json({ error: 'Producto no encontrado' })
            res.json({message: 'Producto eliminado'})
        } catch(e){
            if(e.code === 'ER_ROW_IS_REFERENCED_2'){
                return res.status(409).json({error: 'No se puede borrar: el producto ya tiene órdenes. Poné el stock en 0 en su lugar.'})
            }
            console.error(e)
            res.status(500).json({ error: 'No se pudo eliminar el producto' })
        }
    }
}