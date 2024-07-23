import { Joi, Segments } from "celebrate";

export const SubscriptionSchema = {
    createPlan: {
        [Segments.BODY]: Joi.object({
            name: Joi.string().required(),
            price: Joi.number().required(),
            trialEligible: Joi.boolean().required(),
        }),
    },

    createSubscription: {
        [Segments.BODY]: Joi.object({
            userId: Joi.number().required(),
            planId: Joi.number().required(),
            taxRateIds: Joi.array().items(Joi.string()).required(),
            discountCode: Joi.string().optional().allow("", null),
        }),
    },

    cancelSubscription: {
        [Segments.QUERY]: {
            subscriptionId: Joi.string().required(),
        },
    },

    checkoutSub: {
        [Segments.BODY]: Joi.object({
            userId: Joi.number().required(),
            planId: Joi.number().required(),
            quantity: Joi.number().min(1).required(),
        }),
    },

    createTaxRate: {
        [Segments.BODY]: Joi.object({
            displayName: Joi.string().required(),
            description: Joi.string().required(),
            jurisdiction: Joi.string().required(),
            percentage: Joi.number().min(1).required(),
            inclusive: Joi.boolean().required(),
            country: Joi.string().required(),
        }),
    },

    createDiscount: {
        [Segments.BODY]: Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            percentage: Joi.number().min(1).required(),
            minPrice: Joi.number().min(1).required(),
            maxPercentage: Joi.number().min(1).optional().allow("", null),
        }),
    },
};
