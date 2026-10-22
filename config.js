import fs from 'node:fs'

export const config = {
    port: process.env.PORT ?? 3000,
    SECRET_JWT_KEY: process.env.SECRET_JWT_KEY ?? 'clave-solo-para-desarrollo',
    db: {
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 3306),
        user: process.env.DB_USER ?? 'root',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_NAME ?? 'ecommerce',
        decimalNumbers: true,
        // Aiven exige conexión cifrada
        ssl: process.env.DB_SSL === 'true'
            ? { ca: fs.readFileSync(new URL('./certs/aivenca.pem', import.meta.url)) }
            : undefined
    }
}