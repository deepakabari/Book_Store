import path from "path";
import express, { Express, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import { errors } from "celebrate";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes";
import { handleError } from "./middleware/errorHandler";
import { dbConnection } from "./db/config";
import { logger } from "./utils/logger";
import { engine } from "express-handlebars";

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app: Express = express();

// Retrieve the port number from environment variables
const PORT = process.env.PORT;

app.engine("hbs", engine({ extname: "hbs", defaultLayout: false }));
app.set("view engine", "hbs");
app.set("/templates", path.join(__dirname, "public"));

// Serve static files from the 'public' directory under the 'images' route
app.use("/images", express.static(path.join(__dirname, "public")));

// Parse incoming requests with urlencoded payloads
app.use(bodyParser.urlencoded({ extended: false }));
// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Enable CORS with predefined middleware
app.use(
    cors({
        origin: "*",
        credentials: true,
    }),
);

// Add routing for the application
app.use(router);

// Define a root route handler
app.use("/", (req: Request, res: Response) => {
    res.send("API is working...");
});

// Use Celebrate's error handling middleware
app.use(errors());

// Use custom error handling middleware
app.use(handleError);

// Establish database connection
dbConnection();

// Start the server and listen on the specified port
app.listen(PORT, () => {
    logger.info(`[Server]: Server is running at http://localhost:${PORT}`);
});
