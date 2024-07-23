import { ErrorHandler } from "../../middleware/errorHandler";
import { Book, Cart, User } from "../../db/models";
import { Controller } from "../../interfaces";
import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import { sendSuccessResponse } from "../../middleware/responseHandler";

export const getCart: Controller = async (req, res, next) => {
    const userId = req.user.id;

    // Find all cart entries
    const cart = await Cart.findAll({
        attributes: ["id", "quantity"],
        include: [
            {
                model: Book,
                attributes: ["id", "name", "price"],
            },
            {
                model: User,
                attributes: ["id", "firstName", "lastName"],
            },
        ],
        where: { userId, isPlaced: false },
    });

    if (cart.length === 0) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.CART_EMPTY));
    }

    // Calculate total amount
    const totalAmount = cart.reduce((total, cartItem) => {
        return total + cartItem.quantity * (cartItem.book ? cartItem.book.price : 0);
    }, 0);

    // Respond with a success status and the cart contents
    return sendSuccessResponse(res, messageConstant.CARDS_RETRIEVED, { cart, totalAmount });
};

export const addCart: Controller = async (req, res, next) => {
    // Extract bookId and quantity from the request body
    const { bookId, quantity } = req.body;

    // Retrieve the userId from the authenticated user's information
    const userId = req.user.id;

    const cart = await Cart.findOne({ where: { bookId, userId, isPlaced: false } });

    // Check if the book is already in the user's cart
    if (cart) {
        await cart.increment("quantity", { by: 1 });
        // Respond with a success status and the updated cart entry
        return sendSuccessResponse(res, messageConstant.CART_QUANTITY_UPDATED, cart);
    }

    const book = await Book.findByPk(bookId);

    // Check if the book exist in the database
    if (!book) {
        // If either doesn't exist, return next a not found error
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.BOOK_NOT_FOUND));
    }

    if (book.quantity < quantity) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.QUANTITY_NOT_AVAILABLE));
    }

    // Create a new cart entry with the bookId, userId, and quantity
    const newCart = await Cart.create({
        bookId,
        userId,
        quantity,
    });

    // Respond with a success status and the new cart entry
    return sendSuccessResponse(res, messageConstant.BOOK_ADDED_IN_CART, newCart);
};

export const updateCart: Controller = async (req, res, next) => {
    // Extract bookId and quantity from the request body
    const { bookId, quantity } = req.body;

    // Retrieve the userId from the authenticated user's information
    const userId = req.user.id;

    const book = await Book.findByPk(bookId);

    // Check if the book exist in the database
    if (!book) {
        // If either doesn't exist, return next a not found error
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.BOOK_NOT_FOUND));
    }

    await Cart.update(
        {
            quantity,
        },
        { where: { bookId, userId, isPlaced: false } },
    );

    return sendSuccessResponse(res, messageConstant.CART_UPDATED);
};

export const deleteCart: Controller = async (req, res, next) => {
    const { cartId } = req.params;

    const cart = await Cart.findByPk(cartId);
    if (!cart) {
        return next(new ErrorHandler(httpCode.NOT_FOUND, messageConstant.CART_NOT_FOUND));
    }

    await Cart.destroy({ where: { id: cartId } });

    return sendSuccessResponse(res, messageConstant.CART_DELETED);
};
