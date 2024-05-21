import { Sequelize } from "sequelize-typescript";
import { logger } from "../../utils/logger";
import dotenv from "dotenv";
dotenv.config();
import { User } from "../models/index";

// Retrieve database connection details from environment variables
const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASSWORD;

// Initialize Sequelize with the database credentials
export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: "mysql",
    define: {
        freezeTableName: true,
    },
    models: [User],
    logging: (msg) => {
        // Log a message when the database connection is established
        if (msg === "Executing (default): SELECT 1+1 AS result") {
            logger.info("[Database]: The database is now our best friend. Connection achieved!");
        } else {
            logger.info(msg);
        }
    },
});

// Function to establish a connection to the database
export const dbConnection = async (): Promise<Sequelize> => {
    await sequelize
        .authenticate() // Attempt to authenticate with the database
        .then(() => {
            // Log success message on successful connection
            logger.info("[Database]: The database just swiped right. It’s a match!");
        })
        .catch((err: Error) =>
            // Log error message if the connection fails
            logger.error("Unable to connect to the database.", err),
        );
    return sequelize; // Return the Sequelize instance
};
