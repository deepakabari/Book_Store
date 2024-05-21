import express, { Express, Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();

const PORT = process.env.PORT;

app.use("/", (req: Request, res: Response) => {
    res.send("API is working...");
});

app.listen(PORT, () => {
    console.log(`[Server]: Server is running at http://localhost:${PORT}`);
});
