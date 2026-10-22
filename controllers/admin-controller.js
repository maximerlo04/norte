export class AdminController {
    constructor ({productModel, orderModel}){
        this.productModel = productModel
        this.orderModel = orderModel
    }

    showPanel = async(req,res)=>{
        if(!req.user) return res.redirect('/login')
        if(req.user.role !== 'admin') return res.status(403).send('No autorizado')

        try{
            const [products, orders] = await Promise.all([
                this.productModel.getAll(),
                this.orderModel.getAll()
            ])
            res.render('admin', {products, orders})
        }catch(e){
            console.error(e)
            res.status(500).send('Error al cargar el panel')
        }
    }
}