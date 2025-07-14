import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import userLocation from "./routes/location.route.js";

import { connectDB } from "./config/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use('/api/location', userLocation);

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on PORT: ${process.env.PORT}`);
  });
});