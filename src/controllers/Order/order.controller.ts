import { ErrorHandler } from "../../middleware/errorHandler";
import { Book, Cart, Order, User } from "../../db/models";
import { Controller } from "../../interfaces";
import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";
import { sequelize } from "../../db/config/db.connection";

export const addOrder: Controller = async (req, res, next) => {
    // Begin transaction to ensure atomicity
    const transaction = await sequelize.transaction();

    try {
        // Retrieve userId and cartId from Request body
        const { userId } = req.body;

        // Check if the user already exists
        const user = await User.findOne({ where: { id: userId } });

        // if user not exist
        if (!user) {
            throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST);
        }

        // Get all cart items associated with the cartId
        const cartItems = await Cart.findAll({
            where: { userId, isPlaced: false },
            include: [Book],
            transaction,
        });

        if (cartItems.length === 0) {
            throw new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.CART_EMPTY);
        }

        // Calculate the total amount
        const totalAmount = cartItems.reduce((total, cartItem) => {
            return total + cartItem.quantity * cartItem.book.price;
        }, 0);

        const newOrder = await Order.create(
            {
                userId,
                totalAmount,
            },
            { transaction },
        );

        // Update book quantities and clear cart items
        for (const cartItem of cartItems) {
            const { bookId, quantity } = cartItem;

            // Retrieve the book and its current quantity
            const book = await Book.findByPk(bookId, { transaction });

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
                { where: { id: bookId }, transaction },
            );

            // remove cart item after order is placed
            await Cart.destroy({ where: { id: cartItem.id }, transaction });
        }

        // Commit transaction if all operations succeed
        await transaction.commit();

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.ORDER_CREATED,
            data: newOrder,
        });
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        next(error);
    }
};
