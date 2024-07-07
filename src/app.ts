
import express from "express";
import mongoose from "mongoose";
import router from "./route/userRoute";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv"

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  // "https://notes-fullstack-frontend.vercel.app"
];

dotenv.config();

app.use(cors({
  origin: "https://your-frontend-on-vercel.vercel.app", // e.g., "https://your-frontend-on-vercel.vercel.app"
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));app.use(express.json());
app.use(cookieParser());
app.use("/api", router);

mongoose
  .connect("mongodb+srv://rahulgosh630:6Jr656CLLe4Vab7J@notes-fullstack.ymoxlfq.mongodb.net/")
  .then(() => {
    app.listen(4000);
    console.log("Database is connected! Listening to Localhost: 4000");
  })
  .catch((err) => console.log(err));

// app.listen(4000, () => {
//   console.log("Listening to Localhost: 4000");
// });
