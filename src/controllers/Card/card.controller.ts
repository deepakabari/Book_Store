import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import { ErrorHandler } from "../../middleware/errorHandler";
import { Book, Cart, Order, Payment, User } from "../../db/models";
import { Controller } from "../../interfaces";
import stripe from "../../db/config/stripe";
import linkConstant from "../../constants/link.constant";
import { sendEmailToSeller } from "../Book/book.controller";
import { compileEmailTemplate } from "../../utils/hbsCompiler";

// Way 2: 2. Controller to create a Stripe Checkout session for setting up payment methods
export const createSession: Controller = async (req, res, next) => {
    // Extract userId from request parameters
    const { userId } = req.params;

    // Find the user by primary key (userId)
    const user = await User.findByPk(userId);
    if (!user) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST));
    }

    // Get all cart items associated with the cartId
    const cartItems = await Cart.findAll({
        where: { userId, isPlaced: false },
        include: [
            {
                model: Book,
                attributes: ["id", "name", "price"],
            },
        ],
    });

    if (cartItems.length === 0) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.CART_EMPTY));
    }

    const lineItems = cartItems.map((cartItem) => ({
        price_data: {
            currency: "gbp",
            product_data: {
                name: cartItem.book.name,
            },
            unit_amount: cartItem.book.price * 100,
        },
        quantity: cartItem.quantity,
    }));

    // Create a Stripe Checkout session for setting up a payment method
    const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        payment_method_types: ["card"],
        customer: user.stripeCustomerId,
        success_url: `${linkConstant.SUCCESS}/${userId}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${linkConstant.CANCEL}`,
        mode: "payment",
        shipping_address_collection: {
            allowed_countries: ["IN", "US"],
        },
    });

    if (!session.url) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.SESSION_URL_MISSING));
    }

    // Respond with the session ID
    res.json({ url: session.url });
};

// Way 2: 3. Controller to handle the success URL callback after a successful payment method setup
export const success: Controller = async (req, res, next) => {
    // Extract userId from request parameters and convert to a number
    const userId = +req.params.userId;

    // Find the user by primary key (userId)
    const user = await User.findByPk(userId);
    if (!user) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST));
    }

    // Get all cart items associated with the cartId
    const cartItems = await Cart.findAll({
        where: { userId, isPlaced: false },
        include: [Book],
    });

    if (cartItems.length === 0) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.CART_EMPTY));
    }

    // Extract session_id from query parameters
    const session_id = req.query.session_id as string;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || !session.payment_intent) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.SESSION_FAILED));
    }

    let paymentIntentId: string | undefined;

    if (typeof session.payment_intent === "string") {
        paymentIntentId = session.payment_intent;
    } else if (session.payment_intent && session.payment_intent.id) {
        paymentIntentId = session.payment_intent.id;
    } else {
        // Handle the case where payment_intent.id doesn't exist
        return next(new Error(messageConstant.UNABLE_PAYMENT_INTENT_ID));
    }

    let totalAmount;
    if (session.amount_total) {
        totalAmount = session.amount_total / 100;
    }

    await Order.create({
        userId,
        totalAmount,
        paymentIntentId,
    });

    // Update book quantities and clear cart items
    for (const cartItem of cartItems) {
        const { bookId, quantity } = cartItem;

        // Retrieve the book and its current quantity
        const book = await Book.findByPk(bookId);

        if (!book) {
            return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.BOOK_NOT_FOUND));
        }

        // Ensure there's enough quantity available
        if (book.quantity < quantity) {
            return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.QUANTITY_NOT_AVAILABLE));
        }

        // Update book quantity (subtract ordered quantity)
        await Book.update(
            {
                quantity: book.quantity - quantity,
            },
            { where: { id: bookId }, individualHooks: true },
        );

        // remove cart item after order is placed
        await Cart.destroy({ where: { id: cartItem.id } });
    }
    const templateData = {
        src: "../../public/images/success-icon.png",
        test: "https://www.google.com/imgres?q=payment%20success%20icon&imgurl=https%3A%2F%2Fi.pngimg.me%2Fthumb%2Ff%2F720%2Fm2H7i8N4K9H7d3A0.jpg&imgrefurl=https%3A%2F%2Fnohat.cc%2Ff%2Fconfirm-icon-payment-success%2Fm2H7i8N4K9H7d3A0-202208012237.html&docid=tKcmu44QmA6FAM&tbnid=KubDeLGwbo03oM&vet=12ahUKEwj4rYLXypmHAxX9wzgGHWH-CE0QM3oECG8QAA..i&w=720&h=507&hcb=2&ved=2ahUKEwj4rYLXypmHAxX9wzgGHWH-CE0QM3oECG8QAA",
    };
    // Compile the email template with provided data
    const htmlToSend = await compileEmailTemplate("payment_success", templateData);

    // Set response headers to specify content type as HTML
    res.setHeader("Content-Type", "text/html");

    // Send the compiled HTML email template as response
    res.send(htmlToSend);
    res.end();
};
