import { Joi, Segments } from "celebrate";

export const OrderSchema = {
    add: {
        [Segments.BODY]: {
            userId: Joi.number().required(),
        },
    },
};
