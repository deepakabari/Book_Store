import { Controller } from "../../interfaces";
import dotenv from "dotenv";
import stripe from "../../db/config/stripe";
import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import { Book, Card, Cart, Payment, User } from "../../db/models";
import { ErrorHandler } from "../../middleware/errorHandler";
import { compileEmailTemplate } from "../../utils/hbsCompiler";
import { sendEmail } from "../../utils/email";
import bcrypt from "bcrypt";
import { Stripe } from "stripe";
import linkConstant from "../../constants/link.constant";
dotenv.config();

const ITERATION = process.env.ITERATION;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
const TEST_CLOCK_ID = process.env.TEST_CLOCK;

// Way 1 & 2: First create stripe customer
export const createCustomer: Controller = async (req, res, next) => {
    // Extract userId from request parameters
    const { userId } = req.params;

    // Retrieve the user from the database
    const user = await User.findByPk(userId);
    if (!user) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST));
    }

    let stripeCustomer = user.stripeCustomerId;

    // Check if the user already has a Stripe customer ID
    if (!stripeCustomer) {
        // Create a new Stripe customer
        const customer = await stripe.customers.create({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            test_clock: TEST_CLOCK_ID,
        });

        // Save the Stripe customer ID to the user record in the database
        await User.update({ stripeCustomerId: customer.id }, { where: { id: userId } });
        stripeCustomer = customer.id;
    } else {
        // If the user already has a Stripe customer ID, return next an error
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.CUSTOMER_EXISTS));
    }

    // Respond with the created Stripe customer ID
    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.CUSTOMER_CREATE,
        data: stripeCustomer,
    });
};

// All way: create card holder in stripe
export const addCardHolder: Controller = async (req, res, next) => {
    // Extract userId from request params
    const { userId } = req.params;

    // Retrieve the user from the database
    const user = await User.findByPk(userId);

    if (!user) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST));
    }

    // Check if the user already has a cardholder ID
    if (user.cardHolderId) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.CARD_HOLDER_ALREADY_EXISTS));
    }

    // Create a new cardholder using the Stripe API
    const cardholder = await stripe.issuing.cardholders.create({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone_number: user.phoneNumber,
        status: "active",
        type: "individual",
        individual: {
            first_name: user.firstName,
            last_name: user.lastName,
            dob: { day: 1, month: 11, year: 2003 },
        },
        billing: {
            address: {
                line1: "123 Main Street",
                city: "San Francisco",
                state: "CA",
                postal_code: "94111",
                country: "GB",
            },
        },
    });

    // Check if the cardholder creation failed
    if (!cardholder) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.CARD_HOLDER_FAILED));
    }

    // Save the cardholder ID to the user record in the database
    await User.update({ cardHolderId: cardholder.id }, { where: { id: userId } });

    // Respond with the created cardholder details
    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.CARD_HOLDER_SAVED,
        data: cardholder,
    });
};

// All way: create virtual card using card holder in stripe
export const addCard: Controller = async (req, res, next) => {
    // Extract userId from request parameters
    const { userId } = req.params;

    // Retrieve the user from the database
    const user = await User.findByPk(userId);

    if (!user) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST));
    }

    // Check if the user already has a card associated (cardId is not set)
    let card, cardActivated;
    if (!user.cardId) {
        // If user does not have a card, create a new virtual card using Stripe API
        card = await stripe.issuing.cards.create({
            cardholder: user.cardHolderId,
            currency: "gbp",
            type: "virtual",
            spending_controls: {
                spending_limits: [
                    {
                        amount: 5000000,
                        interval: "daily",
                    },
                ],
            },
        });

        // Activate the newly created card
        cardActivated = await stripe.issuing.cards.update(card.id, { status: "active" });

        // Update the user's record in the database with the newly activated card ID
        await User.update({ cardId: cardActivated.id }, { where: { id: userId } });
    }

    // Respond with success message and data of the activated card
    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.CARD_SAVED,
        data: cardActivated,
    });
};

// Way 1: 3.Called after virtual card creation to send email link of frontend payment page
export const sendPaymentLink: Controller = async (req, res, next) => {
    // Extract customerEmail from request body
    const { customerEmail } = req.body;

    const user = await User.findOne({ where: { email: customerEmail } });
    if (!user) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST));
    }

    // Create the payment form link
    const paymentFormLink = `${linkConstant.PAYMENT_FORM}/${customerEmail}`;

    // Prepare data for email template
    const templateData = {
        customerName: user.firstName,
        paymentFormLink,
    };

    // Compile the email template with customer details
    const htmlToSend = await compileEmailTemplate("index", templateData);

    sendEmail({
        to: customerEmail,
        subject: "Payment Form Link",
        html: htmlToSend,
    });

    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.SUCCESS,
    });
};

// Way 1: 4.Open fill card details page and submit card details
export const openPaymentForm: Controller = async (req, res, next) => {
    // Extracting email from request parameters
    const { email } = req.params;

    // Data needed for the email template
    const templateData = {
        stripePublishableKey: STRIPE_PUBLISHABLE_KEY,
        link: `${linkConstant.CREATE_PAYMENT_FORM}/${email}`,
    };

    // Compile the email template with provided data
    const htmlToSend = await compileEmailTemplate("payment-form", templateData);

    // Set response headers to specify content type as HTML
    res.setHeader("Content-Type", "text/html");

    // Send the compiled HTML email template as response
    res.send(htmlToSend);
    return res.end();
};

// Way 1: 5.This API called directly from frontend when user submit their card details
export const createPaymentMethod: Controller = async (req, res, next) => {
    // Extract email from request parameters and card/token information from request body
    const { email } = req.params;
    const { cardId, cardBrand, expMonth, expYear, cardLastFour, tokenId } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST));
    }

    // Assuming user has a Stripe customer ID stored in user.stripeCustomerId
    const stripeCustomerId = user.stripeCustomerId as string;

    // Create a payment method using Stripe API
    const paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        card: { token: tokenId },
        billing_details: { email: user.email },
    });

    // Attach the created payment method to the Stripe customer
    const paymentMethod1 = await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: stripeCustomerId,
    });

    // Store payment information in your database
    await Payment.create({
        userId: user.id,
        paymentMethodId: paymentMethod.id,
        stripeCustomerId: stripeCustomerId,
    });

    // Hash the last four digits of the card for security
    const hashedCard = await bcrypt.hash(cardLastFour, Number(ITERATION));

    // Store card information in your database
    await Card.create({
        userId: user.id,
        cardId,
        cardBrand,
        expMonth,
        expYear,
        cardLastFour: hashedCard,
        tokenId,
    });

    // Respond with success message and data
    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.PAYMENT_METHOD_CREATED,
        data: paymentMethod1,
    });
};

// Way 3: 3. Create authorization to authorize a payment
export const authorization: Controller = async (req, res, next) => {
    // Extract userId from request parameters
    const { userId } = req.params;

    // Find the user by primary key (userId)
    const user = await User.findByPk(userId);

    // If user does not exist, return next an error
    if (!user) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST));
    }

    // Get the user's card ID
    const cardId = user.cardId as string;

    // Fetch all cart items for the user where the order is not placed yet
    const cartItems = await Cart.findAll({
        where: { userId, isPlaced: false },
        include: [Book],
    });

    // If the cart is empty, return next an error
    if (cartItems.length === 0) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.CART_EMPTY));
    }

    // Calculate the total amount for the cart
    const totalAmount = cartItems.reduce((total, cartItem) => {
        return total + cartItem.quantity * (cartItem.book ? cartItem.book.price : 0);
    }, 0);

    // Create an authorization for the calculated amount using Stripe
    const authorization = await stripe.testHelpers.issuing.authorizations.create({
        amount: totalAmount * 100,
        card: cardId,
        merchant_data: {
            category: "book_stores",
            name: "Book Store",
            network_id: "1234567890",
            postal_code: "94111",
            state: "GB",
            terminal_id: "99999999",
            url: "https://bookstores.io/",
        },
    });

    // Send a success response with the authorization data
    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.AUTHORIZED_SUCCESS,
        data: authorization,
    });
};

// Way 3. 4. Create capture for respective authorization
export const capture: Controller = async (req, res, next) => {
    // Extract authId from request parameters
    const { authId } = req.params;

    // Capture the authorization using Stripe
    const authorization = await stripe.testHelpers.issuing.authorizations.capture(authId);

    // Send a success response with the captured authorization data
    return res.status(httpCode.OK).json({
        status: httpCode.OK,
        message: messageConstant.AUTHORIZED_SUCCESS,
        data: authorization,
    });
};
