import { Joi, Segments } from "celebrate";

export const CartSchema = {
    addCart: {
        [Segments.BODY]: Joi.object({
            bookId: Joi.number().required(),
            quantity: Joi.number().required(),
        }),
    },
};
