import path from "path";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import { errors } from "celebrate";
import dotenv from "dotenv";
import cors from "./middleware/cors";
import router from "./routes";
import { handleError } from "./middleware/errorHandler";
import { dbConnection } from "./db/config";
import { logger } from "./utils/logger";
dotenv.config();

const app: Express = express();

const PORT = process.env.PORT;

app.use("/images", express.static(path.join(__dirname, "src", "public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors);

app.use(router);

app.use("/", (req: Request, res: Response) => {
    res.send("API is working...");
});

app.use(errors());
app.use(handleError);

// Establish database connection
dbConnection();

app.listen(PORT, () => {
    logger.info(`[Server]: Server is running at http://localhost:${PORT}`);
});
