import { Router } from "express";
import { discountController } from "../../controllers";
import { wrapController } from "../../middleware/wrapController";
import { celebrate } from "celebrate";
import { SubscriptionSchema } from "../../validations";

const router = Router();

router.post("/create", celebrate(SubscriptionSchema.createDiscount), wrapController(discountController.createDiscount));

export default router;
