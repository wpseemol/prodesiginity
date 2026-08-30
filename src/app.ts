import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import corsDelegate from "./config/cors";
import rootRouter from "./routes/index";

const app = express();

// CORS must run before the routes and before the body parsers.
app.use(cors(corsDelegate));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", rootRouter);

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

export default app;
