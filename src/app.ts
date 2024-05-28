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

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app: Express = express();

// Retrieve the port number from environment variables
const PORT = process.env.PORT;

// Serve static files from the 'public' directory under the 'images' route
app.use("/images", express.static(path.join(__dirname, "src", "public")));

// Parse incoming requests with urlencoded payloads
app.use(bodyParser.urlencoded({ extended: false }));
// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Enable CORS with predefined middleware
app.use(cors);

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
