import express from "express"
import {join, dirname} from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { productRouter } from "./routes/product-routes.js";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth-routes.js";
import { optionalAuth } from "./middlewares/auth-middleware.js";
import { orderRoutes } from "./routes/order-routes.js";
import { adminRoutes } from "./routes/admin-routes.js";
import { uploadRouter } from "./routes/upload-routes.js";


const app = express();
const PORT = config.port

const __dirname = dirname(fileURLToPath(import.meta.url));

app.set("view engine", "ejs")
app.set("views", join(__dirname, "views"));
app.use(express.static(join(__dirname, "public")));
app.use(express.json())
app.use(cookieParser())
app.use(optionalAuth)


app.get("/", (req,res)=>{
    res.redirect("/catalog")
})


app.use('/', productRouter)
app.use('/auth', authRouter)
app.use('/orders', orderRoutes)
app.use('/admin', adminRoutes)
app.use('/uploads', uploadRouter)

app.get('/login', (req,res) =>{
    res.render("auth")
})

app.listen(PORT, (err)=>{
    if(err){
        console.error('No se pudo iniciar el server: ', err.message)
    }
    console.log(`Server running on http://localhost:${PORT}`)
})