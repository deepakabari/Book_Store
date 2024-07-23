import { Controller } from "../../interfaces/index";
import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import bcrypt from "bcrypt";
import { User } from "../../db/models";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import linkConstant from "../../constants/link.constant";
import { compileEmailTemplate } from "../../utils/hbsCompiler";
import { sendEmail } from "../../utils/email";
import { Op } from "sequelize";
import { ErrorHandler } from "../../middleware/errorHandler";
import { sendSuccessResponse } from "../../middleware/responseHandler";

const SECRET = process.env.SECRET;
const EXPIRESIN = process.env.EXPIRESIN;
const RANDOMBYTES = process.env.RANDOMBYTES;
const ITERATION = process.env.ITERATION;

/**
 * @function login
 * @param req - Express request object, expects `email` and `password` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and a token if the login is successful. If the login is not successful, it returns an error message.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @description This function is an Express controller that handles user login. It validates the request body, checks if the user exists, verifies the password, and if everything is valid, it generates a JWT token and sends it in the response.
 */
export const login: Controller = async (req, res, next) => {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Find user from database
    const existingUser = await User.findOne({
        where: { email },
    });

    // if user not found then give an error
    if (!existingUser) {
        return next(new ErrorHandler(httpCode.UNAUTHORIZED, messageConstant.USER_NOT_EXIST));
    }

    // Check if password matches
    const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

    // if password matches with the password stored in the database then generate a new access token
    if (isPasswordMatch) {
        const token = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                phoneNumber: existingUser.phoneNumber,
                roleId: existingUser.roleId,
            },
            SECRET as string,
            {
                expiresIn: EXPIRESIN,
            },
        );

        return sendSuccessResponse(res, messageConstant.LOGIN_SUCCESS, token);
    } else {
        return next(new ErrorHandler(httpCode.UNAUTHORIZED, messageConstant.WRONG_PASSWORD));
    }
};

/**
 * @function forgotPassword
 * @param req - Express request object, expects `email` in the body.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code, a success message, and a token if the password reset email is successfully sent. If the email is not sent, it returns an error message.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @description This function is an Express controller that handles the password reset process. It validates the request body, checks if the user exists, generates a reset token, sends a password reset email to the user, and sends a success response with the reset token.
 */
export const forgotPassword: Controller = async (req, res, next) => {
    // Extract email from request body
    const { email } = req.body;

    // Check if user exists in the database
    const existingUser = await User.findOne({
        where: { email },
    });

    // if user not found then give an error
    if (!existingUser) {
        return next(new ErrorHandler(httpCode.UNAUTHORIZED, messageConstant.USER_NOT_EXIST));
    }

    // Generate a reset token
    const hashedToken = crypto.randomBytes(Number(RANDOMBYTES)).toString("hex");

    // Check if the token was successfully generated
    if (!hashedToken) {
        return next(new ErrorHandler(httpCode.BAD_GATEWAY, messageConstant.NOT_GET_HASHED_TOKEN));
    }
    // create an instance of expireToken
    let expireToken = new Date();

    // set the expire token time to 60 minutes
    expireToken.setMinutes(expireToken.getMinutes() + 60);

    // update the resetToken and expireToken to the Admin table
    await User.update(
        {
            resetToken: hashedToken,
            expireToken,
        },
        { where: { email } },
    );

    const RESET_URL = linkConstant.RESET_URL;
    const templateData = {
        patientName: existingUser.firstName,
        reset_url: `${RESET_URL}${hashedToken}`,
    };

    const data = await compileEmailTemplate("resetEmail", templateData);

    sendEmail({
        to: email,
        subject: "Password Reset Email",
        html: data,
    });

    return sendSuccessResponse(res, messageConstant.RESET_EMAIL_SENT);
};

/**
 * @function resetPassword
 * @param req - Express request object, expects `newPassword` and `confirmPassword` in the body, and `hash` in the parameters.
 * @param res - Express response object used to send the response.
 * @returns - Returns a Promise that resolves to an Express response object. The response contains the status code and a success message if the password is successfully reset. If the password is not reset, it returns an error message.
 * @throws - Throws an error if there's an issue in the execution of the function.
 * @description This function is an Express controller that handles password reset. It validates the request body, checks if the user exists and the reset token is valid, and if everything is valid, it resets the user's password and sends a success response.
 */
export const resetPassword: Controller = async (req, res, next) => {
    // Extract email, new password, and confirm password from request body
    const { newPassword, confirmPassword } = req.body;
    const { hash } = req.params;

    // Find user in database with matching email and reset token
    const user = await User.findOne({
        where: {
            resetToken: hash,
            expireToken: { [Op.gt]: new Date() }, // Ensure that the reset token is not expired
        },
    });

    // if user not found then give an error of unauthorized
    if (!user) {
        return next(new ErrorHandler(httpCode.UNAUTHORIZED, messageConstant.INVALID_RESET_TOKEN));
    }

    // Check if newPassword matches confirmPassword
    if (newPassword.localeCompare(confirmPassword) != 0) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.PASSWORD_NOT_MATCH));
    }

    // Hash the new Password
    const hashedPassword = await bcrypt.hash(newPassword, Number(ITERATION));

    // Update user's password, resetToken, and expireToken
    await User.update(
        {
            password: hashedPassword,
            resetToken: null,
            expireToken: null,
        },
        { where: { resetToken: hash } },
    );

    // return success response if password was updated
    return sendSuccessResponse(res, messageConstant.PASSWORD_RESET);
};
