import express from "express";
import { connectDB } from './config/db.js'
import routes from './routes/indexRoutes.js'
import cookieParser from "cookie-parser";
const app = express();
// Connect to MongoDB
connectDB();
const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(cookieParser())
app.use(routes)

app.listen(PORT, () =>{
    console.log(`RUNNING IN PORT ${PORT}`)
})
