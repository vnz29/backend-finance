import express from "express";
import { connectDB } from "./config/db.js";
import routes from "./routes/indexRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

// Allow frontend origin
app.use(
  cors({
    origin:
      // " origin: "https://purchase-frontend-spendly.vercel.app",
      "http://localhost:5173",
    credentials: true, // if you're using cookies or authorization headers
  })
);
app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
  const userAgent = req.headers["x-platform"] || "unknown";

  if (/mobile/i.test(userAgent)) {
    req.isMobile = true;
  } else {
    req.isMobile = false;
  }

  next();
});
// Connect to MongoDB
connectDB();
const PORT = process.env.PORT || 3000;

app.use(routes);

app.listen(PORT, () => {
  console.log(`RUNNING IN PORT ${PORT}`);
});
