import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import { ErrorHandler } from "../../middleware/errorHandler";
import { Book, Cart, Order, Payment, User } from "../../db/models";
import { Controller } from "../../interfaces";
import stripe from "../../db/config/stripe";
import Stripe from "stripe";

// Way 2: 2. Controller to create a Stripe Checkout session for setting up payment methods
export const createSession: Controller = async (req, res, next) => {
    try {
        // Extract userId from request parameters
        const { userId } = req.params;

        // Find the user by primary key (userId)
        const user = await User.findByPk(userId);
        if (!user) {
            throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST);
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

        const lineItems = cartItems.map((cartItem) => ({
            price_data: {
                currency: "usd",
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
            mode: "payment",
            shipping_address_collection: {
                allowed_countries: ["IN", "RU"],
            },
            success_url: `http://localhost:4000/card/success/${userId}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: "http://localhost:4000/card/cancel",
        });

        if (!session.url) {
            throw new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.SESSION_URL_MISSING);
        }

        // Respond with the session ID
        res.json({ url: session.url });
    } catch (error) {
        // Handle Stripe API errors specifically
        if (error instanceof Stripe.errors.StripeError) {
            const stripeError = (error.raw as any)?.message || "Unknown error";
            next(new ErrorHandler(httpCode.BAD_REQUEST, `Stripe API Error: ${stripeError}`, true));
        }
        next(error);
    }
};

// Way 2: 3. Controller to handle the success URL callback after a successful payment method setup
export const success: Controller = async (req, res, next) => {
    try {
        // Extract userId from request parameters and convert to a number
        const userId = +req.params.userId;

        // Find the user by primary key (userId)
        const user = await User.findByPk(userId);
        if (!user) {
            throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST);
        }

        // Get all cart items associated with the cartId
        const cartItems = await Cart.findAll({
            where: { userId, isPlaced: false },
            include: [Book],
        });

        if (cartItems.length === 0) {
            throw new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.CART_EMPTY);
        }

        // Extract session_id from query parameters
        const session_id = req.query.session_id as string;

        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ["payment_intent.payment_method"],
        });

        if (!session || !session.payment_intent) {
            throw new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.SESSION_FAILED);
        }

        let paymentIntentId: string | undefined;

        if (typeof session.payment_intent === "string") {
            paymentIntentId = session.payment_intent;
        } else if (session.payment_intent && session.payment_intent.id) {
            paymentIntentId = session.payment_intent.id;
        } else {
            // Handle the case where payment_intent.id doesn't exist
            throw new Error("Unable to retrieve payment intent ID");
        }

        const newOrder = await Order.create({
            userId,
            totalAmount: session.amount_total,
            paymentIntentId,
        });

        // Update book quantities and clear cart items
        for (const cartItem of cartItems) {
            const { bookId, quantity } = cartItem;

            // Retrieve the book and its current quantity
            const book = await Book.findByPk(bookId);

            if (!book) {
                throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.BOOK_NOT_FOUND);
            }

            // Ensure there's enough quantity available
            if (book.quantity < quantity) {
                throw new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.QUANTITY_NOT_AVAILABLE);
            }

            // Update book quantity (subtract ordered quantity)
            await Book.update(
                {
                    quantity: book.quantity - quantity,
                },
                { where: { id: bookId } },
            );

            // remove cart item after order is placed
            await Cart.destroy({ where: { id: cartItem.id } });
        }

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.ORDER_CREATED,
            data: newOrder,
        });
    } catch (error) {
        // Handle Stripe API errors specifically
        if (error instanceof Stripe.errors.StripeError) {
            const stripeError = (error.raw as any)?.message || "Unknown error";
            next(new ErrorHandler(httpCode.BAD_REQUEST, `Stripe API Error: ${stripeError}`, true));
        }
        next(error);
    }
};