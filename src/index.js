import express from "express";
import { connectDB } from "./config/db.js";
import routes from "./routes/indexRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

app.use(cookieParser());
// Allow frontend origin
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // if you're using cookies or authorization headers
  })
);
// Connect to MongoDB
connectDB();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(routes);

app.listen(PORT, () => {
  console.log(`RUNNING IN PORT ${PORT}`);
});
