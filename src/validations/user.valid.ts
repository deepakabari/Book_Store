import { Joi, Segments } from "celebrate";
import linkConstant from "../constants/link.constant";

export const UserSchema = {
    createUser: {
        [Segments.BODY]: Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().regex(RegExp(linkConstant.PASSWORD_REGEX)).required(),
            confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
            userRoleId: Joi.number().required(),
            phoneNumber: Joi.string()
                .min(11)
                .max(13)
                .messages({
                    "string.min": "Phone number must be a 10 digit number", // Custom message for min length
                    "string.max": "Phone number must not exceed 13 digits", // Custom message for max length
                    "string.required": "Phone number is required", // Custom message for required
                })
                .required(),
        }),
    },
};
