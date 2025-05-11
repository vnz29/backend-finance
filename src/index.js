import express from "express";
import { connectDB } from "./config/db.js";
import routes from "./routes/indexRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

// Allow frontend origin
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // if you're using cookies or authorization headers
  })
);
app.use(cookieParser());
app.use(express.json());
// Connect to MongoDB
connectDB();
const PORT = process.env.PORT || 3000;

app.use(routes);

app.listen(PORT, () => {
  console.log(`RUNNING IN PORT ${PORT}`);
});
