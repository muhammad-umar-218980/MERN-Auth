import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express();

const PORT = process.env.PORT || 5000;


const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get("/", (req, res) => {
  res.send("This is the initial backend server for MERN-Auth application.");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

connectDB().then(()=>{
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
})

