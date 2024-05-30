import { ErrorHandler } from "../../middleware/errorHandler";
import { Cart, Order, User } from "../../db/models";
import { Controller } from "../../interfaces";
import httpCode from "../../constants/http.constant";
import messageConstant from "../../constants/message.constant";

export const addOrder: Controller = async (req, res, next) => {
    try {
        const { userId, cartId } = req.body;

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            throw new ErrorHandler(httpCode.NOT_FOUND, messageConstant.USER_NOT_EXIST);
        }

        const newOrder = await Order.create({
            userId,
            cartId,
        });
        await Cart.update({ isPlaced: true }, { where: { id: cartId } });
        await Cart.destroy({ where: { id: cartId } });

        return res.status(httpCode.OK).json({
            status: httpCode.OK,
            message: messageConstant.ORDER_CREATED,
            data: newOrder,
        });
    } catch (error) {
        next(error);
    }
};
