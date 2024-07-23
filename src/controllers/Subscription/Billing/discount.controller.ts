import httpCode from "../../../constants/http.constant";
import messageConstant from "../../../constants/message.constant";
import { ErrorHandler } from "../../../middleware/errorHandler";
import { Discount } from "../../../db/models";
import { Controller } from "../../../interfaces";
import stripe from "../../../db/config/stripe";
import { sendSuccessResponse } from "../../../middleware/responseHandler";

export const createDiscount: Controller = async (req, res, next) => {
    const { name, description, percentage, minPrice, maxPercentage } = req.body;

    // Check if the discount code already exists
    const existingDiscount = await Discount.findOne({ where: { code: name } });
    if (existingDiscount) {
        return next(new ErrorHandler(httpCode.BAD_REQUEST, messageConstant.DISCOUNT_EXISTS));
    }

    // Create a coupon in Stripe based on the discount percentage
    const coupon = await stripe.coupons.create({
        name,
        percent_off: percentage,
    });

    await stripe.promotionCodes.create({
        coupon: coupon.id,
    });

    // Create new discount
    const discount = await Discount.create({
        code: name,
        stripeCouponId: coupon.id,
        description,
        percentage,
        minPrice,
        maxPercentage,
        isActive: true,
    });

    return sendSuccessResponse(res, messageConstant.DISCOUNT_CREATED, discount);
};
