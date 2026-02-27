import express from "express";
import cors from "cors";
import atsRoutes from "./routes/atsRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", atsRoutes);

export default app;
