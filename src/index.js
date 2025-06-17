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
      // "https://purchase-frontend-xwus-nqe7f4vpk-vnz29s-projects.vercel.app",
      "http://localhost:5173",
    credentials: true, // if you're using cookies or authorization headers
  })
);
app.use(cookieParser());
app.use(express.json());
// Connect to MongoDB
connectDB();
const PORT = process.env.PORT || 3000;

app.use(routes);
// MONGO_URI='mongodb+srv://financeDB:eEfGqP5rbuazWnWy@financedatabase.6c9zj.mongodb.net/?retryWrites=true&w=majority&appName=financedatabase'
// ACCESS_TOKEN_SECRET='Tg8#B4r!ZnP*Lw3y@D7hV0bJf2$KmM5s9QqL+FzX'
// REFRESH_TOKEN_SECRET='wQ7zFHvYkH9N3j_sH1M6zPjUJ3RldzqA8Lr2zRtOHWv6CyA8JZeEkQ'
// GOOGLE_CLIENT_ID=your_google_client_id_here
app.listen(PORT, () => {
  console.log(`RUNNING IN PORT ${PORT}`);
});
