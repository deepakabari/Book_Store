import { Joi, Segments } from "celebrate";

export const CategorySchema = {
    createCategory: {
        [Segments.BODY]: Joi.object({
            name: Joi.string().required(),
        }),
    },
};
