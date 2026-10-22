import { Router } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { upload } from '../middlewares/upload.js'
import { authMiddleware, adminMiddleware } from '../middlewares/auth-middleware.js'

export const uploadRouter = Router()

function uploadToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ folder: 'tienda', resource_type: 'image' }, (err, result) => {
                if (err) return reject(err)
                resolve(result)
            })
            .end(buffer)
    })
}

uploadRouter.post('/', authMiddleware, adminMiddleware, (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            const message = err.code === 'LIMIT_FILE_SIZE'
                ? 'La imagen no puede pesar más de 2 MB'
                : err.message
            return res.status(400).json({ error: message })
        }
        if (err) return res.status(400).json({ error: err.message })
        if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' })

        try {
            const result = await uploadToCloudinary(req.file.buffer)
            res.status(201).json({ url: result.secure_url })
        } catch (e) {
            console.error(e)
            res.status(500).json({ error: 'No se pudo subir la imagen' })
        }
    })
})