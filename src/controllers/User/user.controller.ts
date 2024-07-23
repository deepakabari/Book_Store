import { User } from "../../db/models";
import { Controller } from "../../interfaces";
import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import { Status, roles } from "../../utils/enum";
import bcrypt from "bcrypt";
import { ErrorHandler } from "../../middleware/errorHandler";
import { Op, Order } from "sequelize";
import { sendSuccessResponse } from "../../middleware/responseHandler";

const ITERATION = process.env.ITERATION;

/**
 * @function getUsers
 * @param req - The request object containing query parameters for sorting and pagination. (optional).
 * @param res - The response object to send back the retrieved users.
 * @param next - The next middleware function in the stack.
 * @returns - A JSON response with the status code and message and data of all users.
 */
export const getUsers: Controller = async (req, res, next) => {
    // Extract query parameters from the request
    const { page, pageSize, keyword, sortBy, orderBy } = req.query;

    // Calculate pagination parameters
    const pageNumber = parseInt(page as string, 10) || 1;
    const limit = parseInt(pageSize as string, 10) || 10;
    const offset = (pageNumber - 1) * limit;

    // Define sorting order based on query parameters
    const order = sortBy && orderBy ? ([[sortBy, orderBy]] as Order) : [];

    // Query the database to get users with optional keyword search
    const getUsers = await User.findAndCountAll({
        where: {
            ...(keyword
                ? {
                      [Op.or]: [
                          { firstName: { [Op.like]: `%${keyword}%` } },
                          { lastName: { [Op.like]: `%${keyword}%` } },
                      ],
                  }
                : {}),
        },
        order,
        limit,
        offset,
    });

    if (!getUsers.rows) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_FOUND));
    }

    // Return HTTP response with retrieved users data
    return sendSuccessResponse(res, messageConstant.SUCCESS, getUsers);
};

/**
 * @function getUserById
 * @param req - The request object containing parameters for userId.
 * @param res - The response object to send back the retrieved user.
 * @param next - The next middleware function in the stack.
 * @returns - A JSON response with the status code and message and data of user by userId.
 * @description - Retrieves a user from the database based on its user ID.
 */
export const getUserById: Controller = async (req, res, next) => {
    // Extract the userId from request parameters
    const { userId } = req.params;

    // Query the database to find the user by ID
    const user = await User.findOne({ where: { id: userId } });

    // If user is not found, return next a user not found error
    if (!user) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST));
    }

    // Return HTTP response with the retrieved user data
    return sendSuccessResponse(res, messageConstant.USER_RETRIEVED, user);
};

/**
 * @function createUser
 * @param req - Express request object, expects user details in the body.
 * @param res - Express response object used to send the response.
 * @param next - Express next object to pass error to next middleware function.
 * @return nexts - return nexts an error if there's an issue in the execution of the function.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and the created user data if the user is successfully created. If the user is not created, it returns an error message.
 * @description This function is an Express controller that handles user registration. It validates the request body, checks if the user already exists, hashes the password, creates the user and sends the created user data in the response.
 */
export const createUser: Controller = async (req, res, next) => {
    // Destructure required fields from the request body
    const { firstName, lastName, email, password, confirmPassword, userRoleId, phoneNumber } = req.body;

    // Check if a user already exists with the given email
    const existingUser = await User.findOne({ where: { email } });

    // If user exists, return a bad request response
    if (existingUser) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.USER_EXIST));
    }

    // secure the password using bcrypt hashing algorithm
    const hashedPassword = await bcrypt.hash(password, Number(ITERATION));

    // Check if the password and confirm password fields match
    if (password.localeCompare(confirmPassword) != 0) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.PASSWORD_NOT_MATCH));
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
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.USER_CREATION_FAILED));
    }

    // On successful creation, return the new user data with an OK status
    return sendSuccessResponse(res, messageConstant.USER_CREATED, newUser);
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
    // Extract the user ID from the request parameters
    const { id } = req.params;

    // Extract user details from the request body
    const { firstName, lastName, email, password, userRoleId, phoneNumber } = req.body;

    // Find the existing user in the database
    const existingUser = await User.findOne({
        where: { id },
    });

    // If the user does not exist, return next an error
    if (!existingUser) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST));
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
    return sendSuccessResponse(res, messageConstant.USER_UPDATED);
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
    // Convert the user ID from the request parameters to a number
    const id = +req.params.id;

    // Find the existing user in the database
    const existingUser = await User.findOne({
        where: { id },
    });

    // If the user does not exist, return next an error
    if (!existingUser) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST));
    }

    if (existingUser.roleId === 1) {
        return next(new ErrorHandler(httpCode.ACCESS_FORBIDDEN, messageConstant.DELETE_NOT_AUTHORIZED));
    }

    // Delete the user from the database
    await User.destroy({ where: { id } });

    // Return a success response
    return sendSuccessResponse(res, messageConstant.USER_DELETED);
};
