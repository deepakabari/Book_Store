import { Joi, Segments } from "celebrate";
import linkConstant from "../constants/link.constant";

export const AuthSchema = {
    login: {
        [Segments.BODY]: Joi.object({
            email: Joi.string().required().trim().email(),
            password: Joi.string().required(),
        }),
    },

    forgotPassword: {
        [Segments.BODY]: Joi.object({
            email: Joi.string().email().trim().required(),
        }),
    },

    resetPassword: {
        [Segments.BODY]: Joi.object({
            newPassword: Joi.string().required().regex(RegExp(linkConstant.PASSWORD_REGEX)),
            confirmPassword: Joi.string().required().regex(RegExp(linkConstant.PASSWORD_REGEX)),
        }),
        [Segments.PARAMS]: {
            hash: Joi.string().required(),
        },
    },
};
