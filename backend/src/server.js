import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.routes.js";

const app = express();

const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get("/", (req, res) => {
  res.send("This is the initial backend server for MERN-Auth application.");
});

app.use("/api/auth", authRouter);

connectDB().then(()=>{
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
})

