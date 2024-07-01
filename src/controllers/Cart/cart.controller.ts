import { ErrorHandler } from "../../middleware/errorHandler";
import { Book, Cart, User } from "../../db/models";
import { Controller } from "../../interfaces";
import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";

export const getCart: Controller = async (req, res, next) => {
    try {
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
            return res.status(httpCode.NOT_FOUND).json({
                status: httpCode.NOT_FOUND,
                message: messageConstant.CART_EMPTY,
            });
        }

        // Calculate total amount
        const totalAmount = cart.reduce((total, cartItem) => {
            return total + cartItem.quantity * (cartItem.book ? cartItem.book.price : 0);
        }, 0);

        // Respond with a success status and the cart contents
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CART_RETRIEVED,
            data: { cart, totalAmount },
        });
    } catch (error) {
        // Pass any errors to the error-handling middleware
        next(error);
    }
};

export const addCart: Controller = async (req, res, next) => {
    try {
        // Extract bookId and quantity from the request body
        const { bookId, quantity } = req.body;

        // Retrieve the userId from the authenticated user's information
        const userId = req.user.id;

        const cart = await Cart.findOne({ where: { bookId, userId, isPlaced: false } });

        // Check if the book is already in the user's cart
        if (cart) {
            await cart.increment("quantity", { by: 1 });
            // Respond with a success status and the updated cart entry
            return res.status(httpCode.OK).json({
                status: httpCode.OK,
                message: messageConstant.CART_QUANTITY_UPDATED,
                data: cart,
            });
        }

        const book = await Book.findByPk(bookId);

        // Check if the book exist in the database
        if (!book) {
            // If either doesn't exist, throw a not found error
            throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.BOOK_NOT_FOUND);
        }

        if (book.quantity < quantity) {
            throw new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.QUANTITY_NOT_AVAILABLE);
        }

        // Create a new cart entry with the bookId, userId, and quantity
        const newCart = await Cart.create({
            bookId,
            userId,
            quantity,
        });

        // Respond with a success status and the new cart entry
        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.BOOK_ADDED_IN_CART,
            data: newCart,
        });
    } catch (error: any) {
        next(error);
    }
};

export const updateCart: Controller = async (req, res, next) => {
    try {
        // Extract bookId and quantity from the request body
        const { bookId, quantity } = req.body;

        // Retrieve the userId from the authenticated user's information
        const userId = req.user.id;

        const book = await Book.findByPk(bookId);

        // Check if the book exist in the database
        if (!book) {
            // If either doesn't exist, throw a not found error
            throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.BOOK_NOT_FOUND);
        }

        await Cart.update(
            {
                quantity,
            },
            { where: { bookId, userId, isPlaced: false } },
        );

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CART_UPDATED,
        });
    } catch (error: any) {
        // If a SequelizeUniqueConstraintError occurs, pass a CONFLICT error
        if (error.name === "SequelizeUniqueConstraintError") {
            throw new ErrorHandler(httpCode.CONFLICT, messageConstant.BOOK_NAME_UNIQUE);
        }
        next(error);
    }
};

export const deleteCart: Controller = async (req, res, next) => {
    try {
        const { cartId } = req.params;

        const cart = await Cart.findByPk(cartId);
        if (!cart) {
            throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.CART_NOT_FOUND);
        }

        await Cart.destroy({ where: { id: cartId } });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.CART_DELETED,
        });
    } catch (error) {
        next(error);
    }
};
