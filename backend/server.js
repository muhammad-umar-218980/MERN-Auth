import express from "express";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is ready");
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
