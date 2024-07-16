import path from "path";
import { Sequelize } from "sequelize-typescript";
import { logger } from "../../utils/logger";
import dotenv from "dotenv";
dotenv.config();
import { User, Book, Category, Cart, Order, Payment, Card, Plan, Subscription } from "../models/index";

// Retrieve the current environment or default to 'development'
const env = process.env.NODE_ENV as string;

const config = require(path.join(__dirname + "/" + "config.js"))[env];

const { username, database, host, password } = config;

// Initialize Sequelize with the database credentials
export const sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: "mysql",
    define: {
        freezeTableName: true,
    },
    models: [User, Book, Category, Cart, Order, Payment, Card, Plan, Subscription],
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
