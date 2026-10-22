import jwt from 'jsonwebtoken'
import {config} from '../config.js'

export const authMiddleware = (req,res,next) =>{
    const token = req.cookies.access_token
    if(!token) return res.status(401).json({error: 'No autenticado'})
    
    try{
        req.user = jwt.verify(token, config.SECRET_JWT_KEY)
        next()
    } catch(e){
        res.status(401).json({error: 'Token invalido o expirado'})
    }
}

export const adminMiddleware = (req,res,next) =>{
    if(req.user?.role !== 'admin'){
        return res.status(403).json({error: 'No autorizado'})
    }
    next()
}

export const optionalAuth = (req,res,next) =>{
    res.locals.user = null

    const token = req.cookies.access_token
    if(token) {
        try{
            req.user = jwt.verify(token, config.SECRET_JWT_KEY)
            res.locals.user = req.user
        } catch(e){
            console.error(e)
            res.status(401).json({error: 'Token invalido o vencido'})
        }
    }

    next()
}

