import { User } from "../../db/models";
import { Controller } from "../../interfaces";
import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import { Status, roles } from "../../utils/enum";
import bcrypt from "bcrypt";
import { ErrorHandler } from "../../middleware/errorHandler";

const ITERATION = process.env.ITERATION;

/**
 * @function createUser
 * @param req - Express request object, expects user details in the body.
 * @param res - Express response object used to send the response.
 * @param next - Express next object to pass error to next middleware function.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the created user data if the user is successfully created. If the user is not created, it returns an error message.
 * @description This function is an Express controller that handles user registration. It validates the request body, checks if the user already exists, hashes the password, creates the user and sends the created user data in the response.
 */
export const createUser: Controller = async (req, res, next) => {
    try {
        // Destructure required fields from the request body
        const { firstName, lastName, email, password, confirmPassword, userRoleId, phoneNumber } = req.body;

        // Check if a user already exists with the given email
        const existingUser = await User.findOne({ where: { email } });

        // If user exists, return a bad request response
        if (existingUser) {
            throw new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.USER_EXIST);
        }

        // secure the password using bcrypt hashing algorithm
        const hashedPassword = await bcrypt.hash(password, Number(ITERATION));

        // Check if the password and confirm password fields match
        if (password.localeCompare(confirmPassword) != 0) {
            throw new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.PASSWORD_NOT_MATCH);
        }

        // Find the role of the user or default to a predefined role
        const userRole = roles.find((r) => r.id === userRoleId);
        const roleId = userRole ? userRoleId : roles[1].id;
        const role = userRole ? userRole.name : roles[1].name;

        // Create a new user with the provided details and hashed password
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            roleId,
            role,
            status: Status.Active,
            phoneNumber,
        });

        // If user creation fails, return a bad request response
        if (!newUser) {
            throw new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.USER_CREATION_FAILED);
        }

        // On successful creation, return the new user data with an OK status
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.USER_CREATED,
            data: newUser,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @function updateUser
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next middleware function
 * @returns - JSON response with status and message
 * @description Updates user information based on the provided parameters.
 */
export const updateUser: Controller = async (req, res, next) => {
    try {
        // Extract the user ID from the request parameters
        const { id } = req.params;

        // Extract user details from the request body
        const { firstName, lastName, email, password, userRoleId, phoneNumber } = req.body;

        // Find the existing user in the database
        const existingUser = await User.findOne({
            where: { id },
        });

        // If the user does not exist, throw an error
        if (!existingUser) {
            throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST);
        }

        let hashedPassword;
        // secure the password using bcrypt hashing algorithm
        if (password) {
            hashedPassword = await bcrypt.hash(password, Number(ITERATION));
        }

        // Find the user role or default to the existing role
        const userRole = roles.find((r) => r.id === userRoleId);
        const roleId = userRole ? userRoleId : existingUser.roleId === 1 ? 1 : roles[0].id;
        const role = userRole ? userRole.name : existingUser.roleId === 1 ? "admin" : roles[0].name;

        // Update the user's details in the database
        await User.update(
            { firstName, lastName, email, password: hashedPassword, phoneNumber, role, roleId },
            { where: { id } },
        );

        // Return a success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.USER_UPDATED,
        });
    } catch (error: any) {
        // If a SequelizeUniqueConstraintError occurs, send a CONFLICT response
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(httpCode.CONFLICT).json({
                status: httpCode.CONFLICT,
                message: messageConstant.BOOK_NAME_UNIQUE,
            });
        }
        next(error);
    }
};

/**
 * @function deleteUser
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next middleware function
 * @returns - JSON response with status and message
 * @description Deletes a user based on the provided user ID.
 */
export const deleteUser: Controller = async (req, res, next) => {
    try {
        // Convert the user ID from the request parameters to a number
        const id = +req.params.id;

        // Prevent deletion of users with IDs 1 or 2
        if (id === 1 || id === 2) {
            throw new ErrorHandler(httpCode.ACCESS_FORBIDDEN, messageConstant.DELETE_NOT_AUTHORIZED);
        }

        // Find the existing user in the database
        const existingUser = await User.findOne({
            where: { id },
        });

        // If the user does not exist, throw an error
        if (!existingUser) {
            throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST);
        }

        // Delete the user from the database
        await User.destroy({ where: { id } });

        // Return a success response
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.USER_DELETED,
        });
    } catch (error) {
        next(error);
    }
};
