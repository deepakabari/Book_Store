import { User } from "../../db/models";
import { Controller } from "../../interfaces";
import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import { Status, roles } from "../../utils/enum";
import bcrypt from "bcrypt";

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
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.USER_EXIST,
            });
        }

        // secure the password using bcrypt hashing algorithm
        const hashedPassword = await bcrypt.hash(password, Number(ITERATION));

        // Check if the password and confirm password fields match
        if (password.localeCompare(confirmPassword) != 0) {
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.PASSWORD_NOT_MATCH,
            });
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
            return res.status(httpCode.BAD_REQUEST).json({
                status: httpCode.BAD_REQUEST,
                message: messageConstant.USER_CREATION_FAILED,
            });
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
