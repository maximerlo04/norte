import multer from 'multer'

const allowed = ['image/jpeg', 'image/png', 'image/webp']

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (allowed.includes(file.mimetype)) return cb(null, true)
        cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'))
    }
})