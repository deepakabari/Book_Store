import { billingController, SubscriptionController, testClocKController } from "../../controllers";
import { Router } from "express";
import isAuth from "../../middleware/in-auth";
import { wrapController } from "../../middleware/wrapController";
import { celebrate } from "celebrate";
import { SubscriptionSchema } from "../../validations";

// Create a new router object
const router: Router = Router();

router.use(isAuth);

router.post("/create", celebrate(SubscriptionSchema.createTaxRate), wrapController(billingController.createTaxRate));

router.get("/retrieveTax/:taxId", wrapController(billingController.retrieveTax));

export default router;
