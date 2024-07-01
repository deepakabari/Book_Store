import { Joi, Segments } from "celebrate";

export const BookSchema = {
    createBook: {
        [Segments.BODY]: Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            price: Joi.number().min(1).required(),
            categoryId: Joi.number().required(),
            quantity: Joi.number().min(1).required(),
        }),
    },
};
