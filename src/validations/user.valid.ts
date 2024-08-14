import { Joi, Segments } from "celebrate";
import linkConstant from "../constants/link.constant";

export const UserSchema = {
    createUser: {
        [Segments.BODY]: Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string()
                .regex(RegExp("^(?=.*[!@#$%^&*(),.?:{}|<>])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$"))
                .required(),
            confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
            userRoleId: Joi.number().required(),
            phoneNumber: Joi.string().min(10).max(10).required(),
        }),
    },
};
