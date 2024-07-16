import path from "path";
import express, { Express, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import { errors } from "celebrate";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { dbConnection } from "./db/config";
import { logger } from "./utils/logger";
import { engine } from "express-handlebars";
import { wrapController } from "./middleware/wrapController";
import { SubscriptionController } from "./controllers";

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app: Express = express();

// Retrieve the port number from environment variables
const PORT = process.env.PORT;

// Middleware to parse raw JSON bodies for Stripe webhook
app.post(
    "/subscription/webhook",
    express.raw({ type: "application/json" }),
    wrapController(SubscriptionController.webhook),
);

// Setup Handlebars view engine
app.engine("hbs", engine({ extname: "hbs", defaultLayout: false }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "public", "templates"));

// Serve static files from the 'public' directory under the 'images' route
app.use("/images", express.static(path.join(__dirname, "public", "images")));

// Parse incoming requests with urlencoded payloads
app.use(bodyParser.urlencoded({ extended: false }));
// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Enable CORS for all origins
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
app.use(errorHandler);

// Establish database connection
dbConnection()
    .then(() => {
        // Start the server and listen on the specified port
        app.listen(PORT, () => {
            logger.info(`[Server]: Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        logger.error(`[Server]: Failed to connect to the database - ${error.message}`);
    });
