import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {config} from '../config.js'

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60
}

function validateCredentials ({username, password}){
    if (typeof username !== 'string' || username.length <= 3) {
        return 'El usuario debe ser un string y debe tener mas de 3 caracteres'
    }

    if (typeof password !== 'string' ||  password.length < 6) {
        return 'La contraseña debe tener mas de 6 caracteres'
    }
    return null
}

export class AuthController {
    constructor ({ userModel }){
        this.userModel = userModel
    }

    register = async (req,res) =>{
        const {username, password} = req.body
        const error = validateCredentials({username, password})
        if(error){
            return res.status(400).json({error})
        }

        try{
            const exist = await this.userModel.findByUserName({username})
            if(exist) return res.status(409).json({error: 'El usuario ya existe'})
            const passwordHash = await bcrypt.hash(password,10)
            const id = await this.userModel.create({username, passwordHash})

            res.status(201).json({id})
        } catch(e){
            console.error(e)
            res.status(500).json({error: 'No se pudo crear el usuario'})
        }
        
    }

    login = async (req,res) =>{
        const {username, password} = req.body
        const error = validateCredentials({username, password})
        if(error){
            return res.status(400).json({error})
        }

        try{
            const user = await this.userModel.findByUserName({username})
            const isValid = user && await bcrypt.compare(password, user.password)
            if(!isValid) return res.status(401).json({error: 'Usuario o contraseña incorrecta'})

            const token = jwt.sign(
                {id: user.id, username: user.username, role: user.role}, config.SECRET_JWT_KEY, {expiresIn : '1h'}
            )

            res
                .cookie('access_token', token, cookieOptions)
                .json({id:user.id, username: user.username, role: user.role})
        } catch(e){
            console.error(e)
            res.status(500).json({error:'No se puede iniciar Sesion'})
        }
    }
    logout = (req,res) =>{
        res.clearCookie('access_token').json({ message: 'Sesión cerrada' })
    }

    me = (req,res) =>{
        res.json(req.user)
    }
}